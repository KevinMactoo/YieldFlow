const variants = {
  green:  'bg-green-100 text-green-700',
  red:    'bg-red-100 text-red-700',
  amber:  'bg-amber-100 text-amber-700',
  blue:   'bg-blue-100 text-blue-700',
  gray:   'bg-gray-100 text-gray-600',
  purple: 'bg-purple-100 text-purple-700',
}

const statusMap = {
  // Crops
  Growing:    'green',
  Flowering:  'blue',
  Harvesting: 'amber',
  Seedling:   'purple',
  // Livestock / Health
  Active:     'green',
  Sick:       'red',
  Sold:       'gray',
  Done:       'green',
  Ongoing:    'amber',
  // Tasks
  Completed:  'green',
  'In Progress': 'blue',
  Pending:    'gray',
  // Priority
  High:       'red',
  Medium:     'amber',
  Low:        'gray',
  // Payment
  Paid:       'green',
}

export default function Badge({ label, variant }) {
  const v = variant ?? statusMap[label] ?? 'gray'
  return (
    <span className={`badge ${variants[v]}`}>{label}</span>
  )
}
