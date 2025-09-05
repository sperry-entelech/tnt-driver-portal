/**
 * API Route for Pricing Tool Sync
 * Connects HTML pricing tools with driver portal data
 */

import { NextRequest, NextResponse } from 'next/server'
import { PricingSyncService } from '@/lib/pricing-sync'

// GET /api/pricing-sync/availability
// Check real-time vehicle availability for pricing tools
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const requestedDateTime = searchParams.get('datetime')
    const passengerCount = parseInt(searchParams.get('passengers') || '1')
    const serviceType = searchParams.get('service_type') as any
    
    if (!requestedDateTime || !serviceType) {
      return NextResponse.json(
        { error: 'Missing required parameters: datetime, service_type' },
        { status: 400 }
      )
    }
    
    const availability = await PricingSyncService.checkVehicleAvailability(
      requestedDateTime,
      passengerCount,
      serviceType
    )
    
    return NextResponse.json({
      success: true,
      availability
    })
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/pricing-sync/book
// Create booking from pricing tool
export async function POST(request: NextRequest) {
  try {
    const bookingData = await request.json()
    
    // Validate required fields
    const required = ['serviceType', 'vehicleClass', 'pickupDateTime', 'pickupLocation', 'passengerCount', 'platform']
    const missing = required.filter(field => !bookingData[field])
    
    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missing.join(', ')}` },
        { status: 400 }
      )
    }
    
    const result = await PricingSyncService.syncBookingToDriverPortal(bookingData)
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        tripId: result.tripId,
        message: 'Booking synced to driver portal successfully'
      })
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET /api/pricing-sync/fleet-status
// Get real-time fleet status for pricing tools
export async function GET_FleetStatus(request: NextRequest) {
  try {
    const fleetStatus = await PricingSyncService.getFleetStatus()
    
    return NextResponse.json({
      success: true,
      fleet: fleetStatus,
      lastUpdated: new Date().toISOString()
    })
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/pricing-sync/fasttrack
// Update from FastTrack dispatch system
export async function PUT(request: NextRequest) {
  try {
    const { tripId, ...fastTrackData } = await request.json()
    
    if (!tripId) {
      return NextResponse.json(
        { error: 'Missing tripId' },
        { status: 400 }
      )
    }
    
    const result = await PricingSyncService.updateFromFastTrack(tripId, fastTrackData)
    
    return NextResponse.json(result)
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}