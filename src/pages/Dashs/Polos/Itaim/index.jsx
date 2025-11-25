import DashboardLayout from "../../../../components/Layouts/DashboardLayout";

const Itaim = () => {
  return (
     <DashboardLayout>
        <iframe
          title="DASH ISAP ITAIM"
          src="https://app.powerbi.com/view?r=eyJrIjoiNTA4YjE0ODMtNWVhOS00NzRlLWE0NjktMGI2MjQ2ZGU5ZGI4IiwidCI6ImMyMmE3MzJiLTk2NWItNDU4Ni1iZmNkLWY0MjgyNjYzMmFkNyJ9"
          className="w-full h-full border-0"
          allowFullScreen
        />
      </DashboardLayout>
  );
};

export default Itaim;
