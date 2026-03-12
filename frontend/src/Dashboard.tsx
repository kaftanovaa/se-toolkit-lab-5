import { useState, useEffect } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar, Line } from 'react-chartjs-2'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
)

// Types for API responses
interface ScoreBucket {
  bucket: string
  count: number
}

interface TimelineEntry {
  date: string
  submissions: number
}

interface PassRateEntry {
  task: string
  avg_score: number
  attempts: number
}

interface ScoresData {
  status: 'idle' | 'loading' | 'success' | 'error'
  data: ScoreBucket[]
  error?: string
}

interface TimelineData {
  status: 'idle' | 'loading' | 'success' | 'error'
  data: TimelineEntry[]
  error?: string
}

interface PassRatesData {
  status: 'idle' | 'loading' | 'success' | 'error'
  data: PassRateEntry[]
  error?: string
}

const AVAILABLE_LABS = ['lab-04', 'lab-05', 'lab-06']

function Dashboard() {
  const [selectedLab, setSelectedLab] = useState<string>('lab-05')
  const [scoresState, setScoresState] = useState<ScoresData>({
    status: 'idle',
    data: [],
  })
  const [timelineState, setTimelineState] = useState<TimelineData>({
    status: 'idle',
    data: [],
  })
  const [passRatesState, setPassRatesState] = useState<PassRatesData>({
    status: 'idle',
    data: [],
  })

  const apiKey = localStorage.getItem('api_key') ?? ''

  // Fetch function with proper typing
  async function fetchWithAuth<T>(endpoint: string): Promise<T> {
    const response = await fetch(endpoint, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    })
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    return response.json() as Promise<T>
  }

  // Fetch scores data
  useEffect(() => {
    setScoresState({ status: 'loading', data: [] })

    fetchWithAuth<ScoreBucket[]>(`/analytics/scores?lab=${selectedLab}`)
      .then((data) => setScoresState({ status: 'success', data }))
      .catch((err: Error) =>
        setScoresState({ status: 'error', data: [], error: err.message }),
      )
  }, [selectedLab])

  // Fetch timeline data
  useEffect(() => {
    setTimelineState({ status: 'loading', data: [] })

    fetchWithAuth<TimelineEntry[]>(`/analytics/timeline?lab=${selectedLab}`)
      .then((data) => setTimelineState({ status: 'success', data }))
      .catch((err: Error) =>
        setTimelineState({ status: 'error', data: [], error: err.message }),
      )
  }, [selectedLab])

  // Fetch pass rates data
  useEffect(() => {
    setPassRatesState({ status: 'loading', data: [] })

    fetchWithAuth<PassRateEntry[]>(`/analytics/pass-rates?lab=${selectedLab}`)
      .then((data) => setPassRatesState({ status: 'success', data }))
      .catch((err: Error) =>
        setPassRatesState({ status: 'error', data: [], error: err.message }),
      )
  }, [selectedLab])

  // Chart data preparation
  const scoresChartData = {
    labels: scoresState.data.map((item) => item.bucket),
    datasets: [
      {
        label: 'Number of Students',
        data: scoresState.data.map((item) => item.count),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(255, 159, 64, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(54, 162, 235, 0.6)',
        ],
        borderColor: [
          'rgb(255, 99, 132)',
          'rgb(255, 159, 64)',
          'rgb(75, 192, 192)',
          'rgb(54, 162, 235)',
        ],
        borderWidth: 1,
      },
    ],
  }

  const timelineChartData = {
    labels: timelineState.data.map((item) => item.date),
    datasets: [
      {
        label: 'Submissions',
        data: timelineState.data.map((item) => item.submissions),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1,
        fill: true,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Analytics Dashboard</h1>
        <div className="lab-selector">
          <label htmlFor="lab-select">Select Lab: </label>
          <select
            id="lab-select"
            value={selectedLab}
            onChange={(e) => setSelectedLab(e.target.value)}
          >
            {AVAILABLE_LABS.map((lab) => (
              <option key={lab} value={lab}>
                {lab}
              </option>
            ))}
          </select>
        </div>
      </header>

      <div className="charts-container">
        {/* Score Distribution Bar Chart */}
        <div className="chart-card">
          <h2>Score Distribution</h2>
          {scoresState.status === 'loading' && <p>Loading...</p>}
          {scoresState.status === 'error' && (
            <p className="error">Error: {scoresState.error}</p>
          )}
          {scoresState.status === 'success' && (
            <Bar data={scoresChartData} options={chartOptions} />
          )}
        </div>

        {/* Timeline Line Chart */}
        <div className="chart-card">
          <h2>Submissions Timeline</h2>
          {timelineState.status === 'loading' && <p>Loading...</p>}
          {timelineState.status === 'error' && (
            <p className="error">Error: {timelineState.error}</p>
          )}
          {timelineState.status === 'success' && (
            <Line data={timelineChartData} options={chartOptions} />
          )}
        </div>
      </div>

      {/* Pass Rates Table */}
      <div className="chart-card">
        <h2>Pass Rates by Task</h2>
        {passRatesState.status === 'loading' && <p>Loading...</p>}
        {passRatesState.status === 'error' && (
          <p className="error">Error: {passRatesState.error}</p>
        )}
        {passRatesState.status === 'success' && (
          <table className="pass-rates-table">
            <thead>
              <tr>
                <th>Task</th>
                <th>Average Score</th>
                <th>Attempts</th>
              </tr>
            </thead>
            <tbody>
              {passRatesState.data.map((entry) => (
                <tr key={entry.task}>
                  <td>{entry.task}</td>
                  <td>{entry.avg_score.toFixed(1)}</td>
                  <td>{entry.attempts}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default Dashboard
