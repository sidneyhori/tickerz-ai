import React from 'react'
import { Feed } from '../types/feed'

interface FeedListProps {
  feeds: Feed[]
  onEdit: (feed: Feed) => void
  onDelete: (feedId: string) => void
}

export function FeedList({ feeds, onEdit, onDelete }: FeedListProps) {
  if (feeds.length === 0) {
    return (
      <div className="text-gray-500 text-center py-8 text-sm">
        No feeds configured yet. Add your first feed to get started.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {feeds.map((feed) => (
        <div
          key={feed.id}
          className="flex items-center justify-between p-4 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
        >
          <div className="flex-1">
            <h3 className="text-base font-normal text-gray-900">{feed.title}</h3>
            <p className="text-sm text-gray-600 mt-1">{feed.url}</p>
            {feed.description && (
              <p className="text-sm text-gray-500 mt-1">{feed.description}</p>
            )}
            {feed.lastFetched && (
              <p className="text-xs text-gray-400 mt-1">
                Last fetched: {new Date(feed.lastFetched).toLocaleString()}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-2 ml-4">
            <button
              onClick={() => onEdit(feed)}
              className="text-gray-600 hover:text-gray-900 px-2 py-1 rounded text-sm transition-colors"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(feed.id)}
              className="text-red-600 hover:text-red-700 px-2 py-1 rounded text-sm transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  )
} 