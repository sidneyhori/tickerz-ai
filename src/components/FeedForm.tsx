import React, { useState, useEffect } from 'react'
import { Feed } from '../types/feed'

interface FeedFormProps {
  feed?: Feed
  onSubmit: (feed: Feed) => void
  onCancel: () => void
}

export function FeedForm({ feed, onSubmit, onCancel }: FeedFormProps) {
  const [formData, setFormData] = useState<Feed>({
    id: '',
    url: '',
    title: '',
    description: '',
    isActive: true,
  })

  useEffect(() => {
    if (feed) {
      setFormData(feed)
    } else {
      setFormData({
        id: Date.now().toString(),
        url: '',
        title: '',
        description: '',
        isActive: true,
      })
    }
  }, [feed])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-4">
        <div>
          <label htmlFor="url" className="block text-sm font-normal text-gray-700">
            Feed URL
          </label>
          <input
            type="url"
            id="url"
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            className="mt-1 block w-full rounded-lg border border-gray-300 bg-white text-gray-900 text-sm px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            placeholder="https://example.com/feed.xml"
            required
          />
        </div>

        <div>
          <label htmlFor="title" className="block text-sm font-normal text-gray-700">
            Title
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="mt-1 block w-full rounded-lg border border-gray-300 bg-white text-gray-900 text-sm px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            placeholder="My Feed Title"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-normal text-gray-700">
            Description (Optional)
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="mt-1 block w-full rounded-lg border border-gray-300 bg-white text-gray-900 text-sm px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            placeholder="A brief description of this feed"
            rows={3}
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
            Active
          </label>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-normal text-gray-700 hover:text-gray-900 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-normal text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
        >
          {feed ? 'Update' : 'Add'} Feed
        </button>
      </div>
    </form>
  )
} 