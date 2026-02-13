const User = require('../models/User');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_change_in_prod';

const signToken = (id, role, branch) => {
    return jwt.sign({ id, role, branch }, JWT_SECRET, {
        expiresIn: '30d'
    });
};

exports.login = async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });

        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ error: 'Incorrect username or password' });
        }

        const token = signToken(user._id, user.role, user.branch);

        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                username: user.username,
                role: user.role,
                branch: user.branch
            }
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Seed initial users
exports.seedUsers = async () => {
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
        await User.create({
            username: 'admin',
            password: 'admin123', // Will be hashed
            role: 'admin',
            branch: 'Headquarters'
        });
        console.log('Admin user created: admin / admin123');
    }

    // Seed Branch Employees
    const branches = [
        { code: 'met', name: 'Mettupalayam', pass: 'met123' },
        { code: 'thop', name: 'Thoppampatti', pass: 'thop123' },
        { code: 'thud', name: 'Thudiyalur', pass: 'thud123' },
        { code: 'rsp', name: 'RS Puram', pass: 'rsp123' }
    ];

    for (const b of branches) {
        const username = `${b.code}_emp`;
        const exists = await User.findOne({ username });
        if (!exists) {
            await User.create({
                username,
                password: b.pass,
                role: 'employee',
                branch: b.name
            });
            console.log(`Created employee: ${username} / ${b.pass} (${b.name})`);
        }
    }
};

// Get all employees
exports.getEmployees = async (req, res) => {
    try {
        const query = { role: 'employee' };
        if (req.query.branch && req.query.branch !== 'All Branches') {
            query.branch = req.query.branch;
        }
        if (req.user.branch && req.user.branch !== 'Headquarters') {
            query.branch = req.user.branch;
        }
        const employees = await User.find(query).select('-password');
        res.json(employees);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch employees' });
    }
};

// Create new employee
exports.createEmployee = async (req, res) => {
    try {
        const { username, password, branch } = req.body;

        // Check if user exists
        const userExists = await User.findOne({ username });
        if (userExists) return res.status(400).json({ error: 'Username already exists' });

        const newUser = await User.create({
            username,
            password,
            role: 'employee',
            branch: branch || 'Main Branch'
        });

        res.status(201).json({ message: 'Employee created successfully', user: { username: newUser.username, branch: newUser.branch } });
    } catch (err) {
        console.error("Create Employee Error:", err);
        res.status(400).json({ error: err.message || 'Failed to create employee' });
    }
};

