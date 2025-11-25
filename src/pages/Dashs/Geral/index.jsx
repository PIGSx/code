import DashboardLayout from "../../../components/Layouts/DashboardLayout";

const Geral = () => {
   return (
      <DashboardLayout>
        <iframe
          title="DASH 2"
          src="https://app.powerbi.com/reportEmbed?reportId=274328ad-f3ed-473b-8161-57e71fedecb9&autoAuth=true&ctid=38ae2f02-5710-4e12-80bb-83600c3fdf1e"
          className="w-full h-full border-0"
          allowFullScreen
        />
      </DashboardLayout>
    );
  };

export default Geral;
