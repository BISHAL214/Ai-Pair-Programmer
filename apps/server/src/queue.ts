import { Queue } from 'bullmq'
import { connection } from '@ai_pair_programmer/redis'

export const extractQueue = new Queue('extract-jobs', { connection })
