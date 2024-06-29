import Conversation from '../models/conversation.model.js'
import Message from '../models/message.model.js'

export const sendMessage = async (req, res) => {
    try {
        const { message } = req.body
        const { id: receiverId } = req.params
        const senderId = req.user._id

        let conversation = await Conversation.findOne({
            participents: { $all: [senderId, receiverId] }
        })

        if (!conversation) {
            conversation = await Conversation.create({
                participents: [senderId, receiverId]
            })
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            message
        })

        if (newMessage) {
            conversation.messages.push(newMessage._id)
        }

        // SOCKET IO FUNCTIONALLITY WILL GO HERE

        // await conversation.save();
        // await newMessage.save();

        // Tgis will run in paralle
        await Promise.all([conversation.save(), newMessage.save()])

        res.status(201).json(newMessage)
    } catch (error) {
        console.log('Error send message controller: ', error.message)
        res.status(500).json({ message: 'internal server error' })
    }
}

export const getMessages = async (req, res) => {
    try {
        const { id: userToChatId } = req.params
        const senderId = req.user._id

        const conversation = await Conversation.findOne({
            participents: { $all: [senderId, userToChatId] }
        }).populate('messages') // NOT REFRENCE BUT ACTUAL MESSAGES: ITS A MONGO DB THING

        if(!conversation) return res.status(200).json([]);

        const messages = conversation.messages;

        res.status(200).json(messages)
    } catch (error) {
        console.log('Error get message controller: ', error.message)
        res.status(500).json({ message: 'internal server error' })
    }
}
