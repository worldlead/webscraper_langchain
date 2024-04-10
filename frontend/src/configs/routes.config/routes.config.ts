import { lazy } from 'react'
import authRoute from './authRoute'
import homeRoute from './homeRoute'
import type { Routes } from '@/@types/routes'

export const publicRoutes: Routes = [...authRoute]

export const protectedRoutes = [
    ...homeRoute,
]