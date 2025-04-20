'use client'

import React, { useState, useEffect } from 'react'
import { FeedList } from '../../components/FeedList'
import { FeedForm } from '../../components/FeedForm'
import { Feed } from '../../types/feed'

export default function FeedsPage() {
  const [feeds, setFeeds] = useState<Feed[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingFeed, setEditingFeed] = useState<Feed | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchFeeds = async () => {
      try {
        const response = await fetch('/api/feeds')
        const data = await response.json()
        
        if (data.status === 'success') {
          setFeeds(data.data)
        } else {
          setError(data.message || 'Failed to fetch feeds')
        }
      } catch (err) {
        setError('Failed to fetch feeds')
        console.error('Error fetching feeds:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchFeeds()
  }, [])

  const handleAddFeed = async (feed: Feed) => {
    try {
      const response = await fetch('/api/feeds', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feed),
      })

      const data = await response.json()
      
      if (data.status === 'success') {
        if (editingFeed) {
          setFeeds(feeds.map(f => f.id === editingFeed.id ? data.data : f))
        } else {
          setFeeds([...feeds, data.data])
        }
        setShowForm(false)
        setEditingFeed(undefined)
      } else {
        setError(data.message || 'Failed to save feed')
      }
    } catch (err) {
      setError('Failed to save feed')
      console.error('Error saving feed:', err)
    }
  }

  const handleEditFeed = (feed: Feed) => {
    setEditingFeed(feed)
    setShowForm(true)
  }

  const handleDeleteFeed = async (feedId: string) => {
    try {
      const response = await fetch(`/api/feeds/${feedId}`, {
        method: 'DELETE',
      })

      const data = await response.json()
      
      if (data.status === 'success') {
        setFeeds(feeds.filter(feed => feed.id !== feedId))
      } else {
        setError(data.message || 'Failed to delete feed')
      }
    } catch (err) {
      setError('Failed to delete feed')
      console.error('Error deleting feed:', err)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center py-12">
            <p className="text-gray-500">Loading feeds...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center py-12">
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        <header className="mb-12">
          <h1 className="text-3xl font-light text-gray-900">RSS Feed Manager</h1>
          <p className="text-gray-500 mt-2 text-sm">
            Configure and manage your RSS feeds
          </p>
        </header>

        <main>
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-lg font-normal text-gray-900">Your Feeds</h2>
              <button
                onClick={() => setShowForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
              >
                Add New Feed
              </button>
            </div>

            {showForm ? (
              <div className="mb-8">
                <div className="mb-6">
                  <h3 className="text-base font-normal text-gray-900 mb-4">
                    {editingFeed ? 'Edit Feed' : 'Add New Feed'}
                  </h3>
                  <FeedForm
                    feed={editingFeed}
                    onSubmit={handleAddFeed}
                    onCancel={() => {
                      setShowForm(false)
                      setEditingFeed(undefined)
                    }}
                  />
                </div>
              </div>
            ) : (
              <FeedList
                feeds={feeds}
                onEdit={handleEditFeed}
                onDelete={handleDeleteFeed}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  )
} 