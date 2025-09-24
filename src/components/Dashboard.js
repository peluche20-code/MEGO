import React, { useState, useEffect } from 'react'  
import { motion } from 'framer-motion'  
import { BarChart3, FileText, Users, Package, Calendar, Filter } from 'lucide-react'  
import { supabase } from '../utils/supabase'  
import { format } from 'date-fns'  
import { es } from 'date-fns/locale'  

const Dashboard = () => {  
  const [stats, setStats] = useState({})  
  const [loading, setLoading] = useState(true)  
  const [dateRange, setDateRange] = useState('all')  

  useEffect(() => {  
    fetchStats()  
  }, [dateRange])  

  const fetchStats = async () => {  
    const { fromDate, toDate } = getDateFilter()  
    const queries = {  
      totalQuotes: supabase.from('quotes').select('count', { count: 'exact' }).eq('estado', 'generada'),  
      totalBorradores: supabase.from('quotes').select('count', { count: 'exact' }).eq('estado', 'borrador'),  
      totalServices: supabase.from('items').select('count', { count: 'exact' }).eq('tipo', 'servicio'),  
      totalArticles: supabase.from('items').select('count', { count: 'exact' }).eq('tipo', 'articulo').eq('activo', true),  
      totalCustomers: supabase.from('customers').select('count', { count: 'exact' }),  
    }  

    if (dateRange !== 'all') {  
      Object.keys(queries).forEach(key => {  
        if (key.includes('Quotes')) {  
          queries[key] = queries[key].gte('created_at', fromDate).lte('created_at', toDate)  
        }  
      })  
    }  

    const results = await Promise.all(Object.values(queries))  
    const keys = Object.keys(queries)  
    const newStats = {}  
    keys.forEach((key, i) => {  
      newStats[key] = results[i]?.data?.[0]?.count || 0  
    })  

    setStats(newStats)  
    setLoading(false)  
  }  

  const getDateFilter = () => {  
    const now = new Date()  
    let fromDate, toDate  
    switch (dateRange) {  
      case 'month':  
        fromDate = format(new Date(now.getFullYear(), now.getMonth(), 1), "yyyy-MM-dd'T'HH:mm:ss'Z'")  
        toDate = format(now, "yyyy-MM-dd'T'23:59:59'Z'")  
        break  
      case 'year':  
        fromDate = format(new Date(now.getFullYear(), 0, 1), "yyyy-MM-dd'T'HH:mm:ss'Z'")  
        toDate = format(new Date(now.getFullYear(), 11, 31), "yyyy-MM-dd'T'23:59:59'Z'")  
        break  
      default:  
        fromDate = null  
        toDate = null  
        break  
    }  
    return { fromDate, toDate }  
  }  

  const statCards = [  
    { title: 'Cotizaciones Totales', value: stats.totalQuotes + stats.totalBorradores, icon: FileText, color: 'blue' },  
    { title: 'Generadas', value: stats.totalQuotes, icon: FileText, color: 'green' },  
    { title: 'Borradores', value: stats.totalBorradores, icon: FileText, color: 'orange' },  
    { title: 'Clientes', value: stats.totalCustomers, icon: Users, color: 'purple' },  
    { title: 'Artículos', value: stats.totalArticles, icon: Package, color: 'indigo' },  
    { title: 'Servicios', value: stats.totalServices, icon: Package, color: 'teal' },  
  ]  

  if (loading) return <div className="text-center py-8">Cargando métricas...</div>  

  return (  
    <div className="space-y-6">  
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">  
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>  
        <div className="flex flex-col sm:flex-row gap-2">  
          <div className="flex items-center space-x-2">  
            <Filter className="w-4 h-4 text-gray-500" />  
            <select  
              value={dateRange}  
              onChange={(e) => setDateRange(e.target.value)}  
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"  
            >  
              <option value="all">Todo el tiempo</option>  
              <option value="month">Este mes</option>  
              <option value="year">Este año</option>  
            </select>  
          </div>  
        </div>  
      </div>  

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">  
        {statCards.map((card, index) => (  
          <motion.div  
            key={card.title}  
            className={`bg-white p-4 sm:p-6 rounded-xl shadow-md border-l-4 ${  
              `border-${card.color}-500`  
            }`}  
            initial={{ opacity: 0, y: 20 }}  
            animate={{ opacity: 1, y: 0 }}  
            transition={{ delay: index * 0.1 }}  
          >  
            <div className="flex items-center justify-between">  
              <div>  
                <p className="text-sm font-medium text-gray-600 sm:text-base">{card.title}</p>  
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{card.value}</p>  
              </div>  
              <card.icon className={`w-6 h-6 sm:w-8 sm:h-8 text-${card.color}-500`} />  
            </div>  
          </motion.div>  
        ))}  
      </div>  
    </div>  
  )  
}  

export default Dashboard