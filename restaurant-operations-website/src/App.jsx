// import reactLogo from './assets/react.svg'

// import { useState } from 'react'
// import viteLogo from '/vite.svg'

import CustomerMain from './components/customer/CustomerMain.jsx'
import OwnerLogin from './components/owner/OwnerLogin.jsx'

import './index.css'

function App() {
  // const [count, setCount] = useState(0)

  // 역할 손님, 사장
  let customer = true

  return (
    <>
      {customer ? (
        <CustomerMain />
      ) : (
        <OwnerLogin />
      )}

      {/* <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
      </div>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
      </div> */}
    </>
  )
}

export default App
