import DashboardLayout from "../../../components/Layouts/DashboardLayout";
const Petrac = () => {

   return (
      <DashboardLayout>
        <iframe
          title="DASH 2"
        src="https://app.powerbi.com/view?r=eyJrIjoiMWM0NDUyYmQtNTAwNi00ODcxLWJjZGMtMWQ3MDk0NGUyNjY1IiwidCI6ImMyMmE3MzJiLTk2NWItNDU4Ni1iZmNkLWY0MjgyNjYzMmFkNyJ9"
          className="w-full h-full border-0"
          allowFullScreen
        />
      </DashboardLayout>
    );
  };

export default Petrac;
