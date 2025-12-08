import { nanoid } from '@/lib/utils'
import { Chat } from '@/components/chat'

export const metadata = {
  title: 'Chat - AI Chatbot Platform'
}

export default function ChatPage() {
  const id = nanoid()

  return <Chat id={id} />
}







