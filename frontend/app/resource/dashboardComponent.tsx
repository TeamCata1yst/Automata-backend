"use client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useEffect, useState } from "react";
import Link from "next/link";

const api = process.env.APILINK;

type Props = {
	accessToken: string;
};

export default function Home({ accessToken }: Props) {
	const a = accessToken.split(".")[1];
	const b = JSON.parse(atob(a));
	const dayArr = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

	const [avatar, setAvatar] = useState("");

	useEffect(() => {
		fetch(`${api}/org/${b.company}/logo`, {
			headers: {
				"Content-Type": "application/json",
				Token: accessToken,
			},
			method: "GET",
		})
			.then((res) => res.json())
			.then((data) => {
				const bytes = atob(data.logo);
				const bytenums = bytes.split("").map((char) => char.charCodeAt(0));
				const bytearr = new Uint8Array(bytenums);
				setAvatar(URL.createObjectURL(new File([bytearr], "avatar.png")));
			})
			.catch((error) => {
				console.error(error);
			});
	}, []);
	const [loading, setLoading] = useState(true);

	const [client_sat, setClient_sat] = useState("");
	const [quality, setQuality] = useState(0);
	const [late_sub, setLate_sub] = useState("");

	const monthArr = [
		"Jan",
		"Feb",
		"Mar",
		"Apr",
		"May",
		"Jun",
		"Jul",
		"Aug",
		"Sep",
		"Oct",
		"Nov",
		"Dec",
	];

	const [days, setDays] = useState([
		{
			date: "",
			tasks: [
				{
					checklist: [],
					project_id: 0,
					remark: "",
					init_time: "",
					task_id: 0,
					project_name: "",
					name: "",
					deadline: "",
					status: 0,
					time_req: 0,
				},
			],
		},
	]);

	const [queries, setQueries] = useState([
		{
			id: "",
			subject: "",
			status: 0,
			project_id: "",
			description: "",
			project_name: "",
		},
	]);

	const user = atob(accessToken.split(".")[1]);

	const [s_tasks, setS_tasks] = useState<any>([]);

	useEffect(() => {
		const fetchData = async () => {
			try {
				fetch(`${api}/user/review/`, {
					headers: {
						"Content-Type": "application/json",
						Token: accessToken,
					},
					method: "GET",
				})
					.then((res) => res.json())
					.then((data) => {
						setClient_sat((data.client_satisfaction / 5) * 100 + "%");
						setQuality(data.rating);
					})
					.catch((err) => console.error(err));

				const res = await fetch(`${api}/user/project/`, {
					headers: {
						"Content-Type": "application/json",
						Token: accessToken,
					},
					method: "GET",
				});
				const data = await res.json();
				setDays(data);
				setLoading(false);
				// console.log(data);
			} catch (error) {
				console.error(error);
			}
		};

		fetchData();
		setInterval(fetchData, 60000);
	}, []);

	useEffect(() => {
		let tasks: any = [];
		days.map((d) => {
			d.tasks.map((t) => {
				if (t.status == 2 || t.status == 1) tasks.push(t);
			});
		});
		let late_tasks = tasks.filter((t: any) => t.status == 2);
		setLate_sub(((late_tasks.length / tasks.length) * 100).toFixed(2) + "%");
	}, [days]);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const res = await fetch(`${api}/user/query/`, {
					headers: {
						"Content-Type": "application/json",
						Token: accessToken,
					},
					method: "GET",
				});
				const data = await res.json();
				setQueries(data.result);
				console.log(data.result);
			} catch (error) {
				console.error(error);
			}
		};

		fetchData();
		setInterval(fetchData, 60000);
	}, []);

	useEffect(() => {
		let A_days = days;
		A_days.sort((a: any, b: any) => {
			let a_date = new Date(a.date);
			let b_date = new Date(b.date);
			return a_date.getTime() - b_date.getTime();
		});
		setDays(A_days);
	}, [days]);

	useEffect(() => {
		let tasks: any = [];
		days.forEach((d) => {
			d.tasks.forEach((t) => {
				if (t.status == 4) tasks.push(t);
			});
		});
		setS_tasks(tasks);
	}, [days]);

	useEffect(() => {
		console.log(days);
	}, [days]);

	return (
		<>
			<Navbar instance="resource" username={b.company} avatarUrl={avatar} />

			<h1 className="font-primary text-white font-bold text-4xl">Dashboard</h1>
			<hr className="w-20 border-3 border-auto-red my-6" />
			{loading ? (
				<p className="text-white">Loading...</p>
			) : (
				<>
					<h3 className="font-primary text-white font-bold text-2xl pb-4">
						Welcome, {JSON.parse(user).name}
					</h3>
					<div className="w-full flex flex-col gap-4 pb-10">
						<div className="flex gap-4">
							<div className="gap-4 grid grid-cols-6 w-4/5">
								{days.length == 0 ? (
									<p className="text-white">No Tasks Found</p>
								) : (
									days.map((d, j) => {
										if (d.date == "") return;
										const date = new Date(d.date);
										date.setHours(0, 0, 0, 0);
										const currentDate = new Date();
										currentDate.setHours(0, 0, 0, 0);
										if (date.getTime() == currentDate.getTime())
											return (
												<div className="gap-2 flex flex-col" key={j}>
													<div className="bg-[#343434]/10 border-[#343434]/40 border-2 px-4 py-2 rounded-md text-[#0000ff] font-extrabold text-sm w-full">{`${
														dayArr[date.getDay()]
													} ${date.getDate()} ${
														monthArr[date.getMonth()]
													} '${date
														.getFullYear()
														.toString()
														.substring(2)}`}</div>
													<div className="grid grid-cols-1 gap-2">
														{d.tasks.length == 0 ? (
															<div className="bg-black border-[#343434]/40 border-2 px-4 py-2 rounded-md text-white w-full">
																<p className="text-white font-bold font-primary">
																	No Tasks Found
																</p>
															</div>
														) : (
															d.tasks.map((t: any, i: any) => {
																if (t.status === 1 || t.status === 2) return;
																return (
																	<Link
																		style={
																			t.status === 1
																				? { backgroundColor: "#1553038f" } //green
																				: t.status === 2
																				? { backgroundColor: "#9aa1098f" } //yellow-green
																				: t.status === -1
																				? { backgroundColor: "#95050d8f" } //red
																				: Date.parse(t.deadline) <
																				  Date.parse(currentDate.toString())
																				? {
																						backgroundColor: "#95050d8f",
																				  } //red
																				: t.status === 4
																				? {
																						backgroundColor: "#1f009d8f",
																				  } //blue
																				: {}
																		}
																		href={
																			t.query
																				? `/resource/query/${t.query_id}`
																				: `/resource/${t.init_time}_${t.project_id}_${t.task_id}`
																		}
																		className="bg-black/60 border-[#343434]/40 border-2 px-4 py-2 rounded-md text-white w-full"
																		key={i}
																	>
																		<p
																			className="text-white font-bold font-primary"
																			title={t.name}
																		>
																			{t.name}
																		</p>
																		<small>{t.project_name}</small>
																	</Link>
																);
															})
														)}
													</div>
												</div>
											);
										if (
											d.tasks.filter(
												(t: any) => t.status !== 1 && t.status !== 2
											).length > 0
										)
											return (
												<div className="gap-2 flex flex-col" key={j}>
													<div className="bg-[#343434]/10 border-[#343434]/40 border-2 px-4 py-2 rounded-md text-white text-sm w-full">{`${
														dayArr[date.getDay()]
													} ${date.getDate()} ${
														monthArr[date.getMonth()]
													} '${date
														.getFullYear()
														.toString()
														.substring(2)}`}</div>
													<div className="grid grid-cols-1 gap-2">
														{d.tasks.length == 0 ? (
															<div className="bg-black border-[#343434]/40 border-2 px-4 py-2 rounded-md text-white w-full">
																<p className="text-white font-bold font-primary">
																	No Tasks Found
																</p>
															</div>
														) : (
															d.tasks.map((t: any, i: any) => {
																if (t.status === 1 || t.status === 2) return;
																return (
																	<Link
																		style={
																			t.status === 1
																				? { backgroundColor: "#1553038f" } //green
																				: t.status === 2
																				? { backgroundColor: "#9aa1098f" } //yellow-green
																				: t.status === -1
																				? { backgroundColor: "#95050d8f" } //red
																				: Date.parse(t.deadline) <
																				  Date.parse(currentDate.toString())
																				? {
																						backgroundColor: "#95050d8f",
																				  } //red
																				: t.status === 4
																				? {
																						backgroundColor: "#1f009d8f",
																				  } //blue
																				: {}
																		}
																		href={
																			t.query
																				? `/resource/query/${t.query_id}`
																				: `/resource/${t.init_time}_${t.project_id}_${t.task_id}`
																		}
																		className="bg-black border-[#343434]/40 border-2 px-4 py-2 rounded-md text-white w-full"
																		key={i}
																	>
																		<p
																			className="text-white font-bold font-primary"
																			title={t.name}
																		>
																			{t.name}
																		</p>
																		<small>{t.project_name}</small>
																	</Link>
																);
															})
														)}
													</div>
												</div>
											);
									})
								)}
							</div>
							<div className="w-1/5 flex flex-col gap-4">
								<div className="bg-black rounded-lg p-4 w-full">
									<h2 className="font-primary text-white font-bold text-xl pb-2">
										Client Satisfaction
									</h2>
									<span
										className="text-transparent text-4xl stars"
										style={{
											// backgroundClip: 'text',
											backgroundImage:
												"linear-gradient(90deg, #AE0909 0%, #AE0909 " +
												client_sat +
												", #ffffff1a " +
												client_sat +
												")",
										}}
									>
										★★★★★
									</span>
								</div>
								<div className="bg-black rounded-lg p-4 w-full">
									<h2 className="font-primary text-white font-bold text-xl pb-2">
										Quality of Work
									</h2>
									<p className="text-white pl-2 pb-2">{quality}/10</p>
									<div className="rounded-full h-2 w-full overflow-hidden bg-white/10">
										<div
											className="bg-auto-red h-2"
											style={{
												width: (quality / 10) * 100 + "%",
											}}
										></div>
									</div>
								</div>
								<div className="bg-black rounded-lg p-4 w-full">
									<h2 className="font-primary text-white font-bold text-xl pb-2">
										Late Submissions
									</h2>
									<p className="text-white pl-2">{late_sub}</p>
								</div>
								<Link
									href="#queriesSection"
									className="text-white font-primary bg-black rounded-lg p-4 w-full"
								>
									Go to Queries
								</Link>
							</div>
						</div>
					</div>

					<div className="grid grid-cols-2 gap-8">
						<div className="p-2 text-white w-full" id="queriesSection">
							<h2 className="font-primary text-white font-bold text-2xl pb-4">
								Client Queries
							</h2>
							<div className="flex flex-col gap-2">
								{queries.length == 0 ? (
									<p className="text-white">No Queries Found</p>
								) : queries[0].subject == "" ? (
									""
								) : (
									queries.map((q, i) => {
										return (
											<Link
												href={`/resource/query/${q.id}`}
												key={i}
												className={
													"cursor-pointer flex justify-between items-center border-3 border-[#343434]/40 px-6 py-3 rounded-lg" +
													(q.status == 1 ? " bg-[#1553038f]" : " bg-black")
												}
											>
												<h3 className="font-primary text-white font-bold text-lg">
													{q.subject}
												</h3>
												<p className="text-white text-sm">
													{q.project_name} |{" "}
													{q.status == 0
														? "not resolved"
														: q.status == 1
														? "resolved"
														: q.status == 2
														? "task created"
														: "resolved"}
												</p>
											</Link>
										);
									})
								)}
							</div>
						</div>
						<div className="p-2 text-white w-full">
							<h2 className="font-primary text-white font-bold text-2xl pb-4">
								Started Tasks
							</h2>
							<div className="flex flex-col gap-2">
								{s_tasks.length == 0 ? (
									<p className="text-white">No Tasks Found</p>
								) : s_tasks[0].name == "" ? (
									""
								) : (
									s_tasks.map((t: any, i: any) => {
										if (t.query)
											return (
												<Link
													href={`/resource/query/${t.query_id}`}
													key={i}
													className="cursor-pointer flex justify-between items-center border-3 border-[#343434]/40 bg-black px-6 py-2 rounded-lg"
												>
													<h3 className="font-primary text-white font-bold text-lg">
														{t.name}
													</h3>
													<p className="text-white text-sm">{t.project_name}</p>
												</Link>
											);
										return (
											<Link
												href={`/resource/${t.init_time}_${t.project_id}_${t.task_id}`}
												key={i}
												className="cursor-pointer flex justify-between items-center border-3 border-[#343434]/40 bg-black px-6 py-2 rounded-lg"
											>
												<h3 className="font-primary text-white font-bold text-lg">
													{t.name}
												</h3>
												<p className="text-white text-sm">{t.project_name}</p>
											</Link>
										);
									})
								)}
							</div>
						</div>
					</div>
				</>
			)}
		</>
	);
}
