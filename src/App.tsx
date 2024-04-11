import "./App.css";
import EarthCanvas from "./components/EarthCanvas";
import Loading from "./components/Loading";
function App() {
  return (
    <>
      <div id="html2canvas" className="css3d-wapper">
        <div className="fire-div"></div>
      </div>
      <Loading />
      <EarthCanvas />
    </>
  );
}

export default App;
