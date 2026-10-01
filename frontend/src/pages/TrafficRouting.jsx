import { PageHeader } from '../components/AppLayout.jsx'
import PerClientActivity from '../components/PerClientActivity.jsx'

export default function TrafficRouting() {
  return (
    <div>
      <PageHeader
        title="Traffic Routing"
        sub="Complete client traffic distribution ranked by submitted volume"
      />
      <PerClientActivity period="today" showAll showTotals={true} />
    </div>
  )
}
