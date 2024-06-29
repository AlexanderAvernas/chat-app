import bcrypt from 'bcryptjs'
import User from '../models/user.model.js'
import generateTokenAndSetCookie from '../utils/generateToken.js'

export const signup = async (req, res) => {
    try {
        const { fullName, username, password, confirmpassword, gender } =
            req.body

        if (password !== confirmpassword) {
            return res.status(400).json({ error: 'Password dont match' })
        }

        const user = await User.findOne({ username })

        if (user) {
            return res.status(400).json({ error: 'user alrady exist' })
        }

        //HASH password here
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        // http://avatar-placeholder.iran.liara.run/

        const boyProfilePic = `https://avatar.iran.liara.run/public/boy`

        const girlProfilePic = `https://avatar.iran.liara.run/public/girl`

        const newUser = new User({
            fullName,
            username,
            password: hashedPassword,
            gender,
            profilePic: gender === 'male' ? boyProfilePic : girlProfilePic
        })

        if (newUser) {
            // Generate jWT token
            generateTokenAndSetCookie(newUser.id, res)
            await newUser.save()

            res.status(201).json({
                _id: newUser._id,
                fullName: newUser.fullName,
                username: newUser.username,
                profilePic: newUser.profilePic
            })
        } else {
            res.status(400).json({ error: 'invalid user data' })
        }
    } catch (error) {
        console.log('Error in the signup controller', error.message)
        res.status(500).json({ error: 'Internal Server Error' })
    }
}

export const login = async (req, res) => {
    try {
        const { username, password } = req.body
        const user = await User.findOne({ username })
        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password || ''
        )

        if (!user || !isPasswordCorrect) {
            return res
                .status(400)
                .json({ error: 'invalid username or password' })
        }

        generateTokenAndSetCookie(user._id, res)

        res.status(200).json({
            _id: user.id,
            fullName: user.fullName,
            username: user.username,
            profilePic: user.profilePic
        })
    } catch (error) {
        console.log('Error in the login controller', error.message)
        res.status(500).json({ error: 'Internal Server Error' })
    }
}

export const logout = (req, res) => {
    try {
        res.cookie('jwt', '', { maxAge: 0 })
        res.status(200).json({ message: 'Logged out succesfully' })
    } catch (error) {
        console.log('Error in the logout controller', error.message)
        res.status(500).json({ error: 'Internal Server Error' })
    }
}
