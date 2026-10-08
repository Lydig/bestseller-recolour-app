// SQLite CURRENT_TIMESTAMP is UTC without a zone marker.
export const formatDate = (value) => (value ? new Date(value.replace(' ', 'T') + 'Z').toLocaleString() : '')
