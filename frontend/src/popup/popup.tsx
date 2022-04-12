import React from 'react'
import ReactDOM from 'react-dom'
import './popup.css'
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

const App: React.FC<{}> = () => {
  const [alignment, setAlignment] = React.useState('regular');

  const handleChange = (event, newAlignment) => {
    if (newAlignment !== null) {
      chrome.storage.sync.set({
        newAlignment,
      }, () => {
        console.log("DONE!")
      })
      setAlignment(newAlignment);
    }
  };

  chrome.storage.sync.get(["newAlignment"], (res) => {
    setAlignment(res.newAlignment);
  })

  return (
    <ToggleButtonGroup
    color="primary"
    value={alignment}
    exclusive
    onChange={handleChange}
  >
    <ToggleButton value="regular">Regular</ToggleButton>
    <ToggleButton value="assistive">Assistive</ToggleButton>
  </ToggleButtonGroup>
  )
}

const root = document.createElement('div')
document.body.appendChild(root)
ReactDOM.render(<App />, root)
