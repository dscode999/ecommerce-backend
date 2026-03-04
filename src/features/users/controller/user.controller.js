import User from '../model/user.model.js'
import bcrypt from 'bcrypt'
export const getProfile = async (req, res) => {
    try {
        const userProfile = await User.findById(req.user.userId).select('-password')
        if (!userProfile) {
            return res.status(404).json({
                status: 404,
                message: 'profile not found',
                data: null

            })
        }
        res.status(200).json({
            status: 200,
            message: 'profile found',
            data: userProfile

        })


    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: 500,
            message: 'Server Error ',
            data: null

        })



    }



}

export const updateProfile = async (req, res) => {
    try {
        const { name, email } = req.body

        const user = await User.findById(req.user.userId)

        if (!user) {
            return res.status(404).json({
                status: 404,
                message: "User not found",
                data: null
            })
        }

        if (email && email !== user.email) {
            const emailExists = await User.findOne({ email })
            if (emailExists) {
                return res.status(409).json({
                    status: 409,
                    message: "Email already in use",
                    data: null
                })
            }
        }

        if (name) user.name = name
        if (email) user.email = email

        await user.save()

        res.status(200).json({
            status: 200,
            message: "Profile updated successfully",
            data: user
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            status: 500,
            message: "Server Error",
            data: null
        })
    }
}

export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body

        const user = await User.findById(req.user.userId).select('+password')

        if (!user) {
            return res.status(404).json({
                status: 404,
                message: "User not found",
                data: null
            })
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password)

        if (!isMatch) {
            return res.status(400).json({
                status: 400,
                message: "Current password is incorrect",
                data: null
            })
        }

        user.password = newPassword
        await user.save()

        res.status(200).json({
            status: 200,
            message: "Password changed successfully",
            data: null
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            status: 500,
            message: "Server Error",
            data: null
        })
    }
}



export const addAddress = async (req, res) => {
    try {
        const { street, city, zipCode, country } = req.body

        const user = await User.findById(req.user.userId)

        if (!user) {
            return res.status(404).json({
                status: 404,
                message: "User not Found",
                data: null
            })
        }

        user.addresses.push({ street, city, zipCode, country })

        await user.save()

        res.status(201).json({
            status: 201,
            message: "Address added successfully",
            data: user.addresses
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            status: 500,
            message: "Server Error",
            data: null
        })
    }
}



export const updateAddress = async (req, res) => {
    try {
        const { addrId } = req.params
        const { street, city, zipCode, country } = req.body

        const user = await User.findById(req.user.userId)

        if (!user) {
            return res.status(404).json({
                status: 404,
                message: "User not found",
                data: null
            })
        }

        const address = user.addresses.id(addrId)
        console.log("AddressId from params:", addrId)
        console.log("User addresses:", user.addresses.map(a => a._id.toString()))

        if (!address) {
            return res.status(404).json({
                status: 404,
                message: "Address not found",
                data: null
            })
        }


        if (street) address.street = street
        if (city) address.city = city
        if (zipCode) address.zipCode = zipCode
        if (country) address.country = country

        await user.save()

        res.status(200).json({
            status: 200,
            message: "Address updated successfully",
            data: address
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            status: 500,
            message: "Server Error",
            data: null
        })
    }
}


export const deleteAddress = async (req, res) => {
    try {
        const { addrId } = req.params
        const userId = req.user.userId   // מגיע מה-auth middleware

        const user = await User.findById(userId)

        if (!user) {
            return res.status(404).json({
                status: 404,
                message: "User not found",
                data: null
            })
        }

        const address = user.addresses.id(addrId)

        if (!address) {
            return res.status(404).json({
                status: 404,
                message: "Address not found",
                data: null
            })
        }

        address.deleteOne()   // מוחק subdocument
        await user.save()

        res.status(200).json({
            status: 200,
            message: "Address deleted successfully",
            data: user.addresses
        })

    } catch (error) {
        console.log(error)

        res.status(500).json({
            status: 500,
            message: "Server Error",
            data: null
        })
    }
}

export const getAllUsers=async(req,res)=>{
    try {
        const users = await User.find()
        console.log(users)
        res.status(200).json({
            status: 200,
            message: "Users fetched successfully",
            data: users
        })
    } catch (error) {
        console.error("Failed fetching users, Error: ", error)
        res.status(500).json({
            status: 500,
            message: "Failed fetching users..",
            data: null
        })
    }

}


export const updateUserRole = async (req, res) => {
    try {
        const { id } = req.params
        const { role } = req.body

        // בדיקה בסיסית
        if (!['customer', 'admin'].includes(role)) {
            return res.status(400).json({
                status: 400,
                message: "Invalid role. Must be 'customer' or 'admin'",
                data: null
            })
        }

        // למנוע ממנהל לשנות לעצמו תפקיד
        if (req.user.userId === id) {
            return res.status(400).json({
                status: 400,
                message: "Admin cannot change his own role",
                data: null
            })
        }

        const user = await User.findById(id)

        if (!user) {
            return res.status(404).json({
                status: 404,
                message: "User not found",
                data: null
            })
        }

        user.role = role
        await user.save()

        res.status(200).json({
            status: 200,
            message: "User role updated successfully",
            data: {
                id: user._id,
                role: user.role
            }
        })

    } catch (error) {
        console.log(error)

        res.status(500).json({
            status: 500,
            message: "Server Error",
            data: null
        })
    }
}


export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params

        const user = await User.findById(id)

        if (!user) {
            return res.status(404).json({
                status: 404,
                message: "User not found",
                data: null
            })
        }

        await user.deleteOne()

        res.status(200).json({
            status: 200,
            message: "User deleted successfully",
            data: null
        })

    } catch (error) {
        console.log(error)

        res.status(500).json({
            status: 500,
            message: "Server Error",
            data: null
        })
    }
}