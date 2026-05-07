import express from 'express';
// Imports below
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import path from 'path';

const app = express();
const PORT = 3000;
const prisma = new PrismaClient();
const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'my_super_secret_for_jwt';

app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// Auth middleware
const requireAuth = (req: any, res: any, next: any) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ error: 'Forbidden' });
    req.user = user;
    next();
  });
};

// Status Helper
const updateStatus = (member: any) => {
  const endDate = new Date(member.membershipEnd);
  const now = new Date();
  const threeDaysFromNow = new Date();
  threeDaysFromNow.setDate(now.getDate() + 3);

  let status = 'ACTIVE';
  if (endDate < now) {
    status = 'EXPIRED';
  } else if (endDate <= threeDaysFromNow) {
    status = 'EXPIRING_SOON';
  }
  return { ...member, status };
};

// Auth API
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({ id: user.id, email: user.email, name: user.name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ success: true });
});

app.get('/api/auth/me', requireAuth, async (req: any, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id }, select: { id: true, email: true, name: true } });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Dashboard API
app.get('/api/dashboard', requireAuth, async (req, res) => {
  try {
    const rawMembers = await prisma.member.findMany();
    const members = rawMembers.map(updateStatus);

    const activeCount = members.filter((m: any) => m.status === 'ACTIVE').length;
    const overdueCount = members.filter((m: any) => m.status === 'EXPIRED').length;
    const expiringSoonCount = members.filter((m: any) => m.status === 'EXPIRING_SOON').length;
    
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const paymentsThisMonth = await prisma.payment.aggregate({
      _sum: { amount: true },
      where: {
        paymentDate: { gte: startOfMonth }
      }
    });

    res.json({
      activeMembers: activeCount,
      feesCollected: paymentsThisMonth._sum.amount || 0,
      overdueCount,
      expiringSoonCount
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Members API
app.get('/api/members', requireAuth, async (req, res) => {
  try {
    const { status, search } = req.query;
    
    // fetch all and map since status is dynamic
    const members = await prisma.member.findMany({
      orderBy: { name: 'asc' },
      include: { payments: { orderBy: { paymentDate: 'desc' }, take: 1 } }
    });

    const updatedMembers = members.map(updateStatus);

    let filtered = updatedMembers;
    if (status && status !== 'ALL') {
      filtered = filtered.filter(m => m.status === status);
    }
    if (search) {
      const s = String(search).toLowerCase();
      filtered = filtered.filter(m => m.name.toLowerCase().includes(s) || m.phone.includes(s));
    }

    res.json(filtered);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/members', requireAuth, async (req, res) => {
  try {
    const data = req.body;
    // Calculate status based on membershipEnd
    const endDate = new Date(data.membershipEnd);
    const now = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(now.getDate() + 3);

    let status = 'ACTIVE';
    if (endDate < now) {
      status = 'EXPIRED';
    } else if (endDate <= threeDaysFromNow) {
      status = 'EXPIRING_SOON';
    }

    const member = await prisma.member.create({
      data: {
        name: data.name,
        phone: data.phone,
        address: data.address,
        plan: data.plan,
        membershipStart: new Date(data.membershipStart),
        membershipEnd: endDate,
        status,
        payments: {
          create: {
            amount: data.firstPaymentAmount,
            months: data.firstPaymentMonths,
            paymentMode: data.paymentMode || 'CASH',
            newMembershipEnd: endDate,
            notes: 'Initial Payment'
          }
        }
      }
    });
    res.json(member);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create member' });
  }
});

app.get('/api/members/:id', requireAuth, async (req, res) => {
  try {
    const member = await prisma.member.findUnique({
      where: { id: req.params.id },
      include: {
        payments: { orderBy: { paymentDate: 'desc' } }
      }
    });
    if (!member) return res.status(404).json({ error: 'Not found' });
    res.json(member);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Import Members
app.post('/api/members/import', requireAuth, async (req, res) => {
  try {
    const members = req.body.members;
    let successCount = 0;
    let errors: string[] = [];

    for (const m of members) {
      try {
        const endDate = new Date(m.fees_paid_until);
        const now = new Date();
        const threeDaysFromNow = new Date();
        threeDaysFromNow.setDate(now.getDate() + 3);

        let status = 'ACTIVE';
        if (endDate < now) {
          status = 'EXPIRED';
        } else if (endDate <= threeDaysFromNow) {
          status = 'EXPIRING_SOON';
        }

        await prisma.member.create({
          data: {
            name: m.name,
            phone: m.phone,
            address: m.address,
            plan: m.plan || 'Monthly',
            membershipStart: new Date(),
            membershipEnd: endDate,
            status,
            notes: m.notes
          }
        });
        successCount++;
      } catch (err: any) {
        errors.push(`Row for ${m.name || 'Unknown'}: ${err.message}`);
      }
    }

    res.json({ successCount, errors });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Import failed' });
  }
});

// Payments API
app.post('/api/payments', requireAuth, async (req, res) => {
  try {
    const { memberId, amount, months, paymentDate, paymentMode, notes } = req.body;
    
    // Calculate new expiry date
    const member = await prisma.member.findUnique({ where: { id: memberId }});
    if (!member) return res.status(404).json({ error: 'Member not found' });

    let baseDate = new Date(member.membershipEnd);
    const now = new Date();
    if (baseDate < now) {
      baseDate = now;
    }

    const newEndDate = new Date(baseDate);
    newEndDate.setMonth(newEndDate.getMonth() + months);

    // Create payment and update member
    const payment = await prisma.$transaction([
      prisma.payment.create({
        data: {
          memberId,
          amount,
          months,
          paymentDate: new Date(paymentDate),
          paymentMode,
          newMembershipEnd: newEndDate,
          notes
        }
      }),
      prisma.member.update({
        where: { id: memberId },
        data: {
          membershipEnd: newEndDate,
          status: 'ACTIVE' // Will be refreshed by daily cron in real app
        }
      })
    ]);

    res.json(payment[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Payment failed' });
  }
});

// Reports API
app.get('/api/reports/expiry', requireAuth, async (req, res) => {
  try {
    const members = await prisma.member.findMany({
      where: {
        membershipEnd: {
          gte: new Date(req.query.startDate as string),
          lte: new Date(req.query.endDate as string)
        }
      },
      select: { name: true, phone: true, membershipEnd: true, status: true },
      orderBy: { membershipEnd: 'asc' }
    });
    res.json(members);
  } catch(err) { res.status(500).json({ error: 'Server error' });}
});

app.get('/api/reports/collection', requireAuth, async (req, res) => {
  try {
    const py = new Date(), pm = py.getMonth();
    const payments = await prisma.payment.findMany({
      where: { paymentDate: { gte: new Date(py.getFullYear(), py.getMonth(), 1) }},
      include: { member: { select: { name: true } } },
      orderBy: { paymentDate: 'desc' }
    });
    res.json(payments);
  } catch(err) { res.status(500).json({ error: 'Server error' });}
});

app.get('/api/reports/growth', requireAuth, async (req, res) => {
  try {
    // Generate simple growth data for last 6 months
    const data = [];
    for(let i=5; i>=0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const m = d.toLocaleString('default', { month: 'short' });
      const count = await prisma.member.count({
        where: {
          createdAt: {
            gte: new Date(d.getFullYear(), d.getMonth(), 1),
            lt: new Date(d.getFullYear(), d.getMonth() + 1, 1)
          }
        }
      });
      data.push({ name: m, members: count });
    }
    res.json(data);
  } catch(err) { res.status(500).json({ error: 'Server error' });}
});

app.get('/api/reports/expired', requireAuth, async (req, res) => {
  try {
    const expired = await prisma.member.findMany({
      where: { status: 'EXPIRED' },
      select: { name: true, phone: true, membershipEnd: true },
      orderBy: { membershipEnd: 'desc' }
    });
    res.json(expired);
  } catch(err) { res.status(500).json({ error: 'Server error' });}
});

// Start Server
async function startServer() {
  // Setup Daily Cron Email Reminder if Resend is configured
  if (process.env.RESEND_API_KEY && process.env.MANAGER_EMAIL) {
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;
    setInterval(async () => {
      try {
        const now = new Date();
        const threeDaysFromNow = new Date();
        threeDaysFromNow.setDate(now.getDate() + 3);

        const expiringSoon = await prisma.member.findMany({
          where: { membershipEnd: { gte: now, lte: threeDaysFromNow } }
        });
        const overdue = await prisma.member.findMany({
          where: { status: 'EXPIRED' } // relying on db status
        });

        if (expiringSoon.length > 0 || overdue.length > 0) {
          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              from: 'GymDesk <onboarding@resend.dev>',
              to: process.env.MANAGER_EMAIL,
              subject: `Daily Alert: ${overdue.length} Overdue, ${expiringSoon.length} Expiring Soon`,
              html: `<p>Hello Manager,</p>
                     <p>You have <strong>${overdue.length} overdue</strong> accounts and <strong>${expiringSoon.length} accounts expiring within 3 days</strong>.</p>
                     <p>Please log in to GymDesk to view details and action them.</p>
                     <br/>
                     <p>Thanks,<br/>GymDesk Robot</p>`
            })
          });
        }
      } catch (err) {
        console.error("Failed to send daily alert email", err);
      }
    }, ONE_DAY_MS);
  }

  // Vite integration
  if (process.env.NODE_ENV !== 'production' && process.env.VERCEL !== '1') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

if (process.env.VERCEL !== '1') {
  startServer();
}

export default app;
