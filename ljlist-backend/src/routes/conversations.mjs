import { Router } from 'express'
import { Conversation, Message, User, serializeConversation, serializeMessage } from '../models/index.mjs'
import { ok, asyncHandler, badRequest, notFound, forbidden } from '../utils/respond.mjs'
import { getPagination, buildMeta } from '../utils/pagination.mjs'
import { requireAuth } from '../middleware/auth.mjs'

const router = Router()

async function getOrCreateConversation(customerId) {
  let convo = await Conversation.findOne({ customer_id: customerId })
  if (!convo) convo = await Conversation.create({ customer_id: customerId })
  return convo
}

async function assertAccess(convo, user) {
  if (!convo) throw notFound('Conversation not found.')
  if (user.role !== 'admin' && String(convo.customer_id) !== String(user._id)) {
    throw forbidden()
  }
}

// Customer starts (or continues) their support conversation
router.post('/', requireAuth, asyncHandler(async (req, res) => {
  const content = String(req.body?.message || '').trim()
  if (!content) throw badRequest('Message cannot be empty.', { message: ['Type a message first.'] })

  const convo = await getOrCreateConversation(req.user._id)
  await Message.create({ conversation_id: convo._id, sender_id: req.user._id, content })
  convo.last_message = content
  convo.last_message_at = new Date()
  await convo.save()

  const admin = await User.findOne({ role: 'admin' })
  ok(res, { conversation: serializeConversation(convo, admin, 0), ...serializeConversation(convo, admin, 0) },
    { message: 'Message sent.', status: 201 })
}))

// Customer's conversation list (usually just one — theirs with support)
router.get('/', requireAuth, asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query)
  const filter = req.user.role === 'admin' ? {} : { customer_id: req.user._id }
  const [convos, total] = await Promise.all([
    Conversation.find(filter).sort({ last_message_at: -1 }).skip(skip).limit(limit).populate('customer_id'),
    Conversation.countDocuments(filter),
  ])
  const admin = await User.findOne({ role: 'admin' })

  const results = []
  for (const convo of convos) {
    const other = req.user.role === 'admin' ? convo.customer_id : admin
    const unread = await Message.countDocuments({
      conversation_id: convo._id,
      sender_id: { $ne: req.user._id },
      read_at: null,
    })
    results.push(serializeConversation(convo, other, unread))
  }
  const meta = buildMeta(total, page, limit)
  ok(res, { conversations: results, meta }, { meta })
}))

// Messages — shared by customer and admin
router.get('/:id/messages', requireAuth, asyncHandler(async (req, res) => {
  const convo = await Conversation.findById(req.params.id).catch(() => null)
  await assertAccess(convo, req.user)

  const { page, limit, skip } = getPagination(req.query, { defaultLimit: 50 })
  const [items, total] = await Promise.all([
    Message.find({ conversation_id: convo._id }).sort({ created_at: 1 }).skip(skip).limit(limit),
    Message.countDocuments({ conversation_id: convo._id }),
  ])

  // Opening a thread marks the other side's messages as read
  await Message.updateMany(
    { conversation_id: convo._id, sender_id: { $ne: req.user._id }, read_at: null },
    { read_at: new Date() },
  )

  const meta = buildMeta(total, page, limit)
  ok(res, { messages: items.map(serializeMessage), meta }, { meta })
}))

router.post('/:id/messages', requireAuth, asyncHandler(async (req, res) => {
  const convo = await Conversation.findById(req.params.id).catch(() => null)
  await assertAccess(convo, req.user)

  const content = String(req.body?.content || '').trim()
  if (!content) throw badRequest('Message cannot be empty.', { content: ['Type a message first.'] })

  const message = await Message.create({ conversation_id: convo._id, sender_id: req.user._id, content })
  convo.last_message = content
  convo.last_message_at = new Date()
  await convo.save()
  ok(res, serializeMessage(message), { message: 'Message sent.', status: 201 })
}))

export default router
