import ApiService from './ApiService'
import type {
    BusinessInfo,
    QA,
    Question,
    Reply,
    SiteUrls,
} from '@/@types/gpt'


export async function apiGetAnswerFromGPT(data: Question) {
    return await ApiService.fetchData<Reply>({
        url: '/gpt/gpt-pure-reply',
        method: 'post',
        data,
    })
}
