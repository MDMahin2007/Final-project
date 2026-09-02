import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";

const features = [
  {
    title: "Online Clearance Request",
    description:
      "Submit clearance forms from anywhere with a simple dashboard.",
  },
  {
    title: "Real-time Status Tracking",
    description: "See pending, approved, or rejected status updates instantly.",
  },
  {
    title: "Admin Approval System",
    description: "Administrators can review and update requests quickly.",
  },
  {
    title: "Paperless Process",
    description: "Reduce paperwork and speed up the campus clearance workflow.",
  },
];

const Home = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.hash !== "#features") return;
    document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
  }, [location]);

  return (
    <div className="space-y-16">
      <section className="rounded-[2rem] bg-white px-6 py-14 shadow-sm sm:px-10">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
              ClearPath
            </p>
            <h1 className="mt-6 text-4xl font-semibold text-slate-900 sm:text-5xl">
              Smart Campus Clearance & Approval System
            </h1>
            <p className="mt-6 max-w-xl text-slate-600">
              Paperless • Fast • Transparent. Centralize student clearance
              requests and admin approvals in a modern campus system.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/register"
                className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-600"
              >
                Get Started
              </Link>
              <Link
                to="/login"
                className="rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Login
              </Link>
            </div>
          </div>
          <div className="rounded-[2rem] bg-slate-50 p-10 text-center shadow-inner">
            <p className="text-xl font-semibold text-slate-900">
              Campus clearance simplified
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {features.slice(0, 2).map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-3xl bg-white p-5 shadow-sm"
                >
                  <h3 className="font-semibold text-slate-900">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-600">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="grid scroll-mt-24 gap-10 lg:grid-cols-2">
        <div className="rounded-[2rem] bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-slate-900">
            How it works
          </h2>
          <div className="mt-8 space-y-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-primary text-white">
                01
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Submit Request</h3>
                <p className="mt-2 text-sm text-slate-600">
                  Students complete their clearance form and submit it online.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-primary text-white">
                02
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Admin Reviews</h3>
                <p className="mt-2 text-sm text-slate-600">
                  Admins review requests and decide whether to approve or
                  reject.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-primary text-white">
                03
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Get Approval</h3>
                <p className="mt-2 text-sm text-slate-600">
                  Students receive status updates and can track remarks
                  instantly.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="rounded-[2rem] bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-slate-900">
            Key features
          </h2>
          <div className="mt-8 grid gap-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-3xl border border-slate-200 p-5"
              >
                <h3 className="font-semibold text-slate-900">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] bg-primary px-8 py-14 text-white shadow-sm">
        <div className="max-w-3xl">
          <h2 className="text-3xl font-semibold">
            Ready to simplify your clearance process?
          </h2>
          <p className="mt-4 text-slate-100">
            Use ClearPath to manage student workflows, approvals, and record
            tracking in one place.
          </p>
          <Link
            to="/register"
            className="mt-8 inline-flex rounded-full bg-white px-8 py-3 text-sm font-semibold text-primary transition hover:bg-slate-100"
          >
            Get Started
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
