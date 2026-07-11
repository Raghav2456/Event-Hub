const User = require('../models/User');
const OTP = require('../models/otp.js');
const bcrypt = require('bcrypt');
const { sendOtpEmail } = require('../utils/email');
const jwt = require('jsonwebtoken');

    // Function to generate JWT token
    const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '7d' });  // User will be logged in for 7 days
    };

    // Register a user
    exports.registerUser = async (req, res) => {
    const { username, email, password } = req.body;

    // Check if user already exists
    let userExists = await User.findOne({ email });
    if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
    }
    
    // Hash the password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create a new user
    try {
        const newUser = new User({
    username,
    email,
    password: hashedPassword,
    role: "user",
    isVerified: false
});

await newUser.save();

        // Gentrating OTP for email verification
        const otp = Math.floor(100000 + Math.random() * 900000); // 1) Generate a 6-digit OTP
        console.log(`OTP for ${email}: ${otp}`);
        await OTP.create({ email, otp, action: 'account_verification' }); // 2) Save OTP to database
        await sendOtpEmail(email, otp, 'account_verification'); // 3) Send OTP email
        
        // 4) Respond with success message and user email
        res.status(201).json({ 
            message: 'User registered successfully',
              email:  newUser.email});
    }
     
    catch (error) {
        res.status(500).json({ message: 'Error registering user', error });
    }
};

    // Login a user
    exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    let user = await User.findOne({email});
    if (!user) {
        return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({ message: 'Invalid email or password' });
    }   
    
    // Check if the user is verified and has the role of 'user'
    if (!user.isVerified && user.role === 'user')   // or user.role != 'Admin'
        {
        const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a new OTP
        await OTP.deleteMany({ email, action: 'account_verification' }); // Remove any existing OTPs for this email

        await OTP.create({ email, otp, action: 'account_verification' }); // Save OTP to database
        await sendOtpEmail(email, otp, 'account_verification'); // Send OTP email
        return res.status(403).json({
             message: 'Account not verified. A new OTP has been sent to your email.',
             needsVerification: true
            });
        }
        
        // If the user is verified, generate a JWT token and send it in the response
        res.json({
            message: 'Login successful',
            _id : user._id,
            name: user.username,
            email: user.email,
            role: user.role,
            token: generateToken(user._id, user.role)
        })
    };

    // Verify OTP
    exports.verifyOtp = async (req, res) => {
    const { email, otp } = req.body;   
    const otpRecord = await OTP.findOne({ email, otp, action: 'account_verification' });
    
    // If no matching OTP record is found, return an error response
    if (!otpRecord) {
        return res.status(400).json({ message: 'Invalid or expired OTP' });
        }
    
    // If a matching OTP record is found, update the user's verification status
    const user = await User.findOneAndUpdate({ email }, { isVerified: true }, { new: true });
    await OTP.deleteMany({ email, otp, action: 'account_verification' }); // Remove the used OTP
    res.json({ 
        message: 'Account verified successfully, You can Login now!',
        _id : user._id,
        name: user.username,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, user.role)
    });
};