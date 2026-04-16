import { Breadcrumb, Container, Heading, Text, Box, Button, HStack, Icon } from "@chakra-ui/react";
import { TiArrowBack } from "react-icons/ti";
import React, { useRef, useState, useEffect } from "react";

export default function GolfTracking() {
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [uploadStatus, setUploadStatus] = useState<string>("");
    const [jobId, setJobId] = useState<string | null>(null);
    const [jobStatus, setJobStatus] = useState<string>("");
    const [polling, setPolling] = useState(false);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setVideoFile(e.target.files[0]);
            setUploadStatus("");
        }
    };

    const handleTrackVideo = async () => {
        if (!videoFile) {
            setUploadStatus("Vælg venligst en video først.");
            return;
        }
        setUploadStatus("Uploader og tracker video...");
        const formData = new FormData();
        formData.append("video", videoFile);
        try {
            const response = await fetch("/api/track-golf-video/", {
                method: "POST",
                body: formData,
            });
            if (response.ok) {
                const data = await response.json();
                setJobId(data.jobId);
                setUploadStatus("Videoen er uploadet! Din video er nu ved at blive processeret. Du får besked, når behandlingen er færdig.");
                setPolling(true);
            } else {
                setUploadStatus("Fejl ved upload eller tracking.");
            }
        } catch (err) {
            setUploadStatus("Netværksfejl ved upload.");
        }
    };

    // Poll for job status every 30 seconds
    useEffect(() => {
        let interval: number;
        if (polling && jobId) {
            const poll = async () => {
                try {
                    const res = await fetch(`/api/track-golf-video-status/${jobId}`);
                    if (res.ok) {
                        const data = await res.json();
                        setJobStatus(data.status);
                        if (data.status === 'done') {
                            setPolling(false);
                            setVideoUrl(`/api/track-golf-video-result/${jobId}`);
                        } else if (data.status === 'error') {
                            setPolling(false);
                        }
                    } else {
                        setJobStatus('Ukendt status');
                    }
                } catch {
                    setJobStatus('Netværksfejl ved statusopslag');
                }
            };
            poll();
            interval = setInterval(poll, 30000);
        }
        return () => { if (interval) clearInterval(interval); };
    }, [polling, jobId]);

    return (
        <Container position="relative">
            <Breadcrumb.Root size="lg" ml={{base:"0em", sm:"0em", md:"-16em", lg:"-16em"}} mt="0.5em" mb="0.5em">
                <Breadcrumb.List>
                    <Breadcrumb.Item>
                        <Breadcrumb.Link href="../" color="#2B4570">Home</Breadcrumb.Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Separator />
                    <Breadcrumb.Item>
                        <Breadcrumb.Link href="/ongoing" color="#2B4570">Ongoing Work</Breadcrumb.Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Separator />
                    <Breadcrumb.Item>
                        <Breadcrumb.CurrentLink color="#2B4570">Golf Tracking</Breadcrumb.CurrentLink>
                    </Breadcrumb.Item>
                </Breadcrumb.List>
            </Breadcrumb.Root>
            <Box className="dropShadow">
                <HStack justifyItems="center" mb="1em">
                    <Button asChild variant="outline" size="xs" rounded="full" colorPalette="teal" color="#2B4570">
                        <a href="/ongoing"><Icon color="cyan.solid" size="2xl"><TiArrowBack /></Icon></a>
                    </Button>
                    <Heading as="h2" size="2xl" ml="0.5em">Golf Tracking</Heading>
                </HStack>
                <Text textStyle="xl" maxWidth="30em" mb="1em">
                    This is a page dedicated to a golf tracking experiment I built in OpenCV to explore golf tracking primarily using classical computer vision, but also with the help of a YOLOv8 deep learning model to detect the golfer.

I can also mention that other elements of the algorithm include the ability to predict the ball’s movement, a multi-factor ranking system to determine the most likely ball position, and the ability to track the ball even when it is partially occluded by the player. There is also a scene classification model that can classify whether the scene is grass, sky, audience, etc., and it can detect scene changes. Additionally, it can use fused blob splitting to locate the ball near the hole or the club.
                    <br />
                    <br />
                    <p>
Below, you can see an example video where the ball has been tracked by my algorithm. It’s not perfect, but it works fairly well.                    </p>
                    <br />
                    <p>
                    Further down the page, you can also upload your own video to see how the algorithm tracks the ball in your footage.
                    </p>
                    <p></p>
                </Text>
                <Box w="50%" maxW="350px" mb={4}>
                    <Heading as="h3" size="lg" mb={2}>Example: Tracked Video</Heading>
                    <video
                        src="/examplevideo.mp4"
                        controls
                        style={{ width: '100%', borderRadius: '8px' }}
                    />
                </Box>
                <br />
                Try with your own golf video and see how well the algorithm can track the ball in your footage! Upload a video and see the results below.
                It should work with videos with H.264 codecs, so MP4 files but also some *.AVI and *.MOV files.
                It is best if the video has a clear view of the ball and not too much movement or too many objects in the scene, as this can make tracking more difficult.
                <br />
                It takes approximately twice as long as the video duration to track it, so a 1-minute video will take about 2 minutes to process.
                <br />
                <Box w="100%" maxW="700px" minH="300px" p={6} m={0} bg="#f5f5f5" borderRadius="lg" display="flex" flexDirection="column" alignItems="center" justifyContent="center" gap={4}>
                    <input
                        type="file"
                        accept="video/*"
                        style={{ display: 'none' }}
                        ref={fileInputRef}
                        onChange={handleFileChange}
                    />
                    <Button onClick={() => fileInputRef.current?.click()} colorScheme="teal" variant="outline">
                        Upload video
                    </Button>
                    {videoFile && <Text color="green.700">Valgt fil: {videoFile.name}</Text>}
                    <Button onClick={handleTrackVideo} colorScheme="blue" disabled={!videoFile}>
                        Track video
                    </Button>
                    {uploadStatus && <Text color="gray.700">{uploadStatus}</Text>}
                    {jobStatus === 'done' && videoUrl && (
                        <Box w="100%" mt={4}>
                            <Text fontWeight="bold" mb={2}>Tracked video:</Text>
                            <video
                                src={videoUrl}
                                controls
                                style={{ width: '100%', maxWidth: '700px', borderRadius: '8px' }}
                            />
                        </Box>
                    )}
                    {jobStatus === 'processing' && <Text color="blue.600">Video behandles...</Text>}
                    {jobStatus === 'error' && <Text color="red.600">Der opstod en fejl under behandlingen.</Text>}
                </Box>
            </Box>
        </Container>
    );
}
