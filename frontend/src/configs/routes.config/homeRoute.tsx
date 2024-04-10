import { lazy } from 'react'
import type { Routes } from '@/@types/routes'
import { USER } from '@/constants/roles.constant'

const homeRoute: Routes = [
    {
        key: 'home.newSearch',
        path: `home/new-search/*`,
        component: lazy(() => import('@/views/home/NewSearch')),
        authority: [],
    },
    
]

export default homeRoute