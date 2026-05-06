import Login from './pages/Login'

export default function App() {
  return <Login onLogin={(data) => console.log('login:', data)} />
}
