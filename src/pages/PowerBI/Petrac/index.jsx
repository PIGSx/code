import "./petrac.css";

const Petrac = () => {
  return (
    <div className="petrac">
      <iframe
        title="DASH 2"
        src="https://app.powerbi.com/reportEmbed?reportId=123198fb-d969-422f-918d-bd1e66d37a3e&autoAuth=true&ctid=38ae2f02-5710-4e12-80bb-83600c3fdf1e"
        frameBorder="0"           // ✅ React usa frameBorder com B maiúsculo
        allowFullScreen           // ✅ basta colocar sem = "true"
      ></iframe>
    </div>
  );
};

export default Petrac;
