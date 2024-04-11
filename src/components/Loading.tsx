import "./Loading.css";
function Loading() {
  // this would be removed by World after loading resources
  return (
    <div id="loading">
      <div className="sk-chase">
        <div className="sk-chase-dot"></div>
        <div className="sk-chase-dot"></div>
        <div className="sk-chase-dot"></div>
        <div className="sk-chase-dot"></div>
        <div className="sk-chase-dot"></div>
        <div className="sk-chase-dot"></div>
      </div>
      <div>加载资源中...</div>
    </div>
  );
}

export default Loading;
