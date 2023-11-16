// prettier-ignore
/* eslint-disable */
import React, { useState, useEffect } from 'react';
import AWS from "aws-sdk";
import axios from "axios";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Card";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import { Fab } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CircularProgress from "@mui/material/CircularProgress";
import "./App.css";
import CopyToClipboardButton from "./CopyToClipboardButton";
import TextField from "@mui/material/TextField";

import DownloadIcon from "@mui/icons-material/Download";

const preURL = "https://d3h7w3t8nvcc5d.cloudfront.net";
// 'http://localhost:3000'

const s3 = new AWS.S3({
	accessKeyId: "AKIASSWWRIZRBPXP53WW",
	secretAccessKey: "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",
	region: "us-east-1",
});

function CircularProgressWithLabel(props) {
	return (
		<Box
			sx={{ position: "relative", display: "inline-flex", marginLeft: "20px" }}
		>
			<CircularProgress className="cp" variant="determinate" {...props} />
			<Box
				sx={{
					top: 0,
					left: 0,
					bottom: 0,
					right: 0,
					position: "absolute",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
				}}
			>
				<Typography component="div" variant="h3" color="text.secondary">
					{`${Math.round(props.value)}%`}
				</Typography>
			</Box>
		</Box>
	);
}

const UploadLargeFile = () => {
	const [file, setFile] = useState(null);
	const [progress, setProgress] = useState(0);
	const [a, setA] = useState(null);
	const [b, setB] = useState(null);
	const [isInvalid, setIsInvalid] = useState(null);
	const [url, setUrl] = useState(false);
	// const [url2, setUrl2] = useState(false);

	useEffect(() => {
		if (window.location.pathname !== "/") {
			const x = window.location.pathname.split("/")[1];
			setB(x);
			axios
				.post(
					"https://p0siw891bf.execute-api.us-east-1.amazonaws.com/prod/file-upload",
					`${x}--get`
				)
				.then((e) => {
					setA(e.data);
					const res = e.data.res.Items.filter((e) => e.userFriendlyUrl === x);
					if (res.length === 0) {
						setIsInvalid(true);
					} else {
						setUrl(res[0].url);
						// setUrl2(res[0].userFriendlyUrl);
					}
				});
		}
	}, []);

	const handleFileChange = (e) => {
		setFile(e.target.files[0]);
	};

	const handleUpload = () => {
		setA(null);
		const a = file.name.split(".");
		a.splice(a.length - 1, 0, Date.now());

		const name = a.join(".");

		const params = {
			Bucket: "testproj101",
			Key: name,
			Body: file,
			ContentType: file.type,
			ACL: "public-read",
		};

		const options = {
			partSize: 10 * 1024 * 1024, // 10 MB
			queueSize: 2, // Number of concurrent uploads
		};

		s3.upload(params, options, (err, data) => {
			if (err) {
				console.log("Error uploading file:", err);
			} else {
				console.log("File uploaded successfully:", data);
				axios
					.post(
						"https://p0siw891bf.execute-api.us-east-1.amazonaws.com/prod/file-upload",
						`${name}--post`
					)
					.then((e) => {
						setA(e.data);
					});
			}
		}).on("httpUploadProgress", (progress) => {
			const percentage = Math.round((progress.loaded / progress.total) * 100);
			setProgress(percentage);
		});
	};

	const handleUploadAnother = () => {
		window.location.reload();
	};

	if (isInvalid) {
		return (
			<div
				className="test"
				style={{
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
				}}
			>
				<h1>Invalid URL Provided</h1>
			</div>
		);
	}

	if (b) {
		const urlToDownload = `${preURL}/${b}`;

		return (
			<div
				className="test"
				style={{
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
				}}
			>
				<Paper elevation={3} sx={{ minWidth: 300, height: 400 }}>
					{/* eslint-disable-next-line  */}
					<a
						className="pp"
						href={`https://testproj101.s3.amazonaws.com/${url}`}
						target="_blank"
						rel="noopener"
					>
						<Fab
							color="primary"
							size="large"
							component="div"
							aria-label="download"
						>
							<DownloadIcon className="download-icon" />
						</Fab>
					</a>

					<div style={{ display: "flex", justifyContent: "center" }}>
						<TextField
							id="outlined-basic"
							className="text-dd"
							variant="outlined"
							value={urlToDownload}
						/>
					</div>
				</Paper>
			</div>
		);
	}

	const urlToCopy = a ? `${preURL}/${a}` : null;

	return (
		<div
			className="test"
			style={{
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
			}}
		>
			<Paper className="pp-o" elevation={3} sx={{ minWidth: 300, height: 400 }}>
				{progress > 0 ? (
					<CircularProgressWithLabel value={progress} />
				) : (
					<Grid container spacing={1}>
						<Grid item>
							<div>
								<label htmlFor="upload-photo">
									<input
										style={{ display: "none" }}
										id="upload-photo"
										name="upload-photo"
										multiple
										type="file"
										onChange={handleFileChange}
									/>
									<Fab
										color="primary"
										//	size="small"
										component="span"
										aria-label="add"
									>
										<div class="myDiv">
											<CloudUploadIcon />
										</div>
									</Fab>
								</label>
							</div>
						</Grid>
						{/* <Grid display="flex" alignItems="center" item xs={8}>
							<Typography display="inline" noWrap variant="h6" gutterBottom>
								Uplaod File
							</Typography>
						</Grid> */}
					</Grid>
				)}
				{urlToCopy && (
					<div className="cc">
						<TextField
							id="outlined-basic"
							variant="outlined"
							value={urlToCopy}
						/>
						<CopyToClipboardButton url={urlToCopy} />
					</div>
				)}
				{urlToCopy ? (
					<Button
						disabled={!file}
						className="link-button-again"
						variant="contained"
						onClick={handleUploadAnother}
					>
						Upload Another File
					</Button>
				) : (
					<Button
						disabled={!file}
						className="link-button"
						variant="contained"
						onClick={handleUpload}
					>
						Get a Link
					</Button>
				)}
			</Paper>
		</div>
	);
};

export default UploadLargeFile;
// import React, { useState, useEffect } from "react";
// import AWS from "aws-sdk";
// import axios from "axios";
// import JSZip from "jszip";
// import { saveAs } from "file-saver";
// import Box from "@mui/material/Box";
// import Paper from "@mui/material/Card";
// import Button from "@mui/material/Button";
// import Typography from "@mui/material/Typography";
// import Grid from "@mui/material/Grid";
// import { Fab } from "@mui/material";
// import CloudUploadIcon from "@mui/icons-material/CloudUpload";
// import CircularProgress from "@mui/material/CircularProgress";
// import TextField from "@mui/material/TextField";
// import DownloadIcon from "@mui/icons-material/Download";

// const preURL = "https://d3h7w3t8nvcc5d.cloudfront.net";

// const s3 = new AWS.S3({
// 	accessKeyId: "AKIASSWWRIZRBPXP53WW",
// 	secretAccessKey: "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",
// 	region: "us-east-1",
// });

// function CircularProgressWithLabel(props) {
// 	return (
// 		<Box
// 			sx={{ position: "relative", display: "inline-flex", marginLeft: "20px" }}
// 		>
// 			<CircularProgress className="cp" variant="determinate" {...props} />
// 			<Box
// 				sx={{
// 					top: 0,
// 					left: 0,
// 					bottom: 0,
// 					right: 0,
// 					position: "absolute",
// 					display: "flex",
// 					alignItems: "center",
// 					justifyContent: "center",
// 				}}
// 			>
// 				<Typography component="div" variant="h3" color="text.secondary">
// 					{`${Math.round(props.value)}%`}
// 				</Typography>
// 			</Box>
// 		</Box>
// 	);
// }

// const UploadLargeFile = () => {
// 	const [files, setFiles] = useState([]);
// 	const [progress, setProgress] = useState(0);
// 	const [responses, setResponses] = useState([]);
// 	const [isInvalid, setIsInvalid] = useState(null);

// 	useEffect(() => {
// 		if (window.location.pathname !== "/") {
// 			const x = window.location.pathname.split("/")[1];
// 			axios
// 				.post(
// 					"https://p0siw891bf.execute-api.us-east-1.amazonaws.com/prod/file-upload",
// 					`${x}--get`
// 				)
// 				.then((e) => {
// 					const res = e.data.res.Items.filter((e) => e.userFriendlyUrl === x);
// 					if (res.length === 0) {
// 						setIsInvalid(true);
// 					}
// 				});
// 		}
// 	}, []);

// 	const handleFileChange = (e) => {
// 		setFiles(Array.from(e.target.files));
// 	};

// 	const handleUpload = async () => {
// 		try {
// 			setResponses([]);
// 			setProgress(0);

// 			const zip = new JSZip();

// 			for (const file of files) {
// 				const name = `${file.name.split(".")[0]}-${Date.now()}.${file.name
// 					.split(".")
// 					.pop()}`;
// 				zip.file(name, file);
// 			}

// 			const zipBlob = await zip.generateAsync({ type: "blob" });

// 			const params = {
// 				Bucket: "testproj101",
// 				Key: "multi-file-archive.zip",
// 				Body: zipBlob,
// 				ContentType: "application/zip",
// 				ACL: "public-read",
// 			};

// 			const options = {
// 				partSize: 10 * 1024 * 1024, // 10 MB
// 				queueSize: 2, // Number of concurrent uploads
// 			};

// 			const response = await s3.upload(params, options).promise();
// 			setResponses([response]);
// 		} catch (error) {
// 			console.error("Error uploading files:", error);
// 		}
// 	};

// 	const handleDownloadLink = () => {
// 		saveAs(`${preURL}/multi-file-archive.zip`);
// 	};

// 	return (
// 		<div
// 			className="test"
// 			style={{
// 				display: "flex",
// 				justifyContent: "center",
// 				alignItems: "center",
// 			}}
// 		>
// 			<Paper className="pp-o" elevation={3} sx={{ minWidth: 300, height: 400 }}>
// 				{isInvalid && (
// 					<div
// 						style={{
// 							display: "flex",
// 							justifyContent: "center",
// 							alignItems: "center",
// 						}}
// 					>
// 						<h1>Invalid URL Provided</h1>
// 					</div>
// 				)}
// 				{responses.length === 0 && (
// 					<div>
// 						<Grid container spacing={1}>
// 							<Grid item>
// 								<div>
// 									<label htmlFor="upload-photo">
// 										<input
// 											style={{ display: "none" }}
// 											id="upload-photo"
// 											name="upload-photo"
// 											multiple
// 											type="file"
// 											onChange={handleFileChange}
// 										/>
// 										<Fab color="primary" component="span" aria-label="add">
// 											<div class="myDiv">
// 												<CloudUploadIcon />
// 											</div>
// 										</Fab>
// 									</label>
// 								</div>
// 							</Grid>
// 						</Grid>
// 						{progress > 0 ? (
// 							<CircularProgressWithLabel value={progress} />
// 						) : (
// 							<Button
// 								disabled={!files.length}
// 								className="link-button"
// 								variant="contained"
// 								onClick={handleUpload}
// 							>
// 								Get Link for Multiple Files
// 							</Button>
// 						)}
// 					</div>
// 				)}
// 				{responses.length > 0 && (
// 					<div>
// 						<TextField
// 							id="outlined-basic"
// 							variant="outlined"
// 							value={`${preURL}/multi-file-archive.zip`}
// 						/>
// 						<Button
// 							disabled={!files.length}
// 							className="link-button-again"
// 							variant="contained"
// 							onClick={handleDownloadLink}
// 						>
// 							Download Link for Multiple Files
// 						</Button>
// 					</div>
// 				)}
// 			</Paper>
// 		</div>
// 	);
// };

// export default UploadLargeFile;
