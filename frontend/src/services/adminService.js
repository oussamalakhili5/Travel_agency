import api from './api'

function buildRecentActivity({ hotels, transports, reservations }) {
  const items = []

  if (hotels.length > 0) {
    items.push({
      kind: 'hotel',
      title: hotels[0].name,
      description: hotels[0].city,
    })
  }

  if (transports.length > 0) {
    items.push({
      kind: 'transport',
      title: transports[0].company,
      description: `${transports[0].departure_city} -> ${transports[0].arrival_city}`,
    })
  }

  if (reservations.length > 0) {
    items.push({
      kind: 'reservation',
      title: reservations[0].status,
      description:
        reservations[0].hotel?.name ||
        reservations[0].transport?.company ||
        reservations[0].reserved_item_summary?.title ||
        '',
    })
  }

  return items
}

export async function getAdminDashboardData() {
  const [hotels, transports, reservations] = await Promise.all([
    getAdminHotels(),
    getAdminTransports(),
    getAdminReservations(),
  ])

  return {
    hotelsCount: hotels.length,
    transportsCount: transports.length,
    accessibleReservationsCount: reservations.length,
    recentActivity: buildRecentActivity({ hotels, transports, reservations }),
  }
}

export async function getAdminHotels() {
  const response = await api.get('admin/hotels/')
  return response.data
}

export async function getAdminTransports() {
  const response = await api.get('admin/transports/')
  return response.data
}

export async function getAdminReservations() {
  const response = await api.get('admin/reservations/')
  return response.data
}

const adminService = {
  getAdminDashboardData,
  getAdminHotels,
  getAdminTransports,
  getAdminReservations,
}

export default adminService
