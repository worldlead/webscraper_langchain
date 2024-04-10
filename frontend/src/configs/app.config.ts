
export type AppConfig = {
    apiPrefix: string
    authenticatedEntryPath: string
    unAuthenticatedEntryPath: string
    tourPath: string
    locale: string
    enableMock: boolean
}

const appConfig: AppConfig = {
    apiPrefix: import.meta.env.VITE_BASE_URL ?  import.meta.env.VITE_BASE_URL as string : "http://localhost:5000/api/v1",
    authenticatedEntryPath: '/home/new-search',
    unAuthenticatedEntryPath: '/sign-in',
    tourPath: '/',
    locale: 'en',
    enableMock: false,
}

export default appConfig
