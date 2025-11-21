// import reactLogo from './assets/react.svg'

// import { useState } from 'react'
// import viteLogo from '/vite.svg'

import CustomerMain from './screens/customer/CustomerMain.tsx'
import OwnerLogin from './screens/owner/OwnerLogin.tsx'

import './index.css'

function App() {
  // const [count, setCount] = useState(0)

  // 역할 손님, 사장
  const customer = true

  return (  // return 안에 최상위 요소는 한개만 가능해서 <></> 빈 tag를 쓸 때도 있고 안쓸 때도 있음(빈 tag는 실제 tag는 없게 들어가는거임)
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
