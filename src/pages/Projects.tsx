import { Card,Image, Box, Grid, GridItem, Heading, Link} from "@chakra-ui/react"
import { FaExternalLinkSquareAlt } from "react-icons/fa";

const fontLuckiestGuy = {
  fontFamily: 'LuckiestGuy'
}

export default function Projects() {
  return (
        <Grid templateRows="repeat(6, 1fr)" pt="2em"bg="rgba(0,0,0,0)">
              <GridItem rounded="lg" maxW={{smDown: "350px"}}>
                <Card.Root className="dropShadow" p="0em" mt="0" mb="4em" size="sm" flexDirection="row" overflow="hidden" maxW="3xl" ml="auto" _hover={{ boxShadow: "lg" , transform: "scale(1.02)"}} transition="all 0.3s ease-in-out">
                  <Image
                    hideBelow="md"
                    objectFit="cover"
                    maxW="200px"
                    order="3"
                    src="/nordea.png"
                    alt="Caffe Latte"
                  />
                  <Box>
                    <Card.Body m="3em">

                      <Heading  as="h2" pb="2em" size="2xl" style={fontLuckiestGuy}>Nordea Netbank</Heading>
                      <Card.Description  color="#2B4570">
                        Nordic Netbank project, to develop a completely new web and mobile bank. With a strong focus on design, usability and security. Initially based on Angular components but over time Nordea developed their own design framework. You can get an overview of the netbank on below youtube video. My contribution have been both hands on frontend development, ux designs, agile support as scrum master and business priority as product owner.
                        <Link color="#2B4570" m="0em 1em" href="https://www.youtube.com/watch?v=cnQjPIU2grQ" target="_blank">Presentation of Nordea (Business) Netbank<FaExternalLinkSquareAlt  /></Link>
                      </Card.Description>
                    </Card.Body>
                    <Card.Footer>
                    </Card.Footer>
                  </Box>
                </Card.Root>
              </GridItem>
              <GridItem rounded="lg" maxW={{smDown: "350px"}} >
                <Card.Root className="dropShadow" p="0em" mt="0" mb="4em"  bg="#2B4570"  color="white" flexDirection="row" overflow="hidden" maxW="3xl" mr="auto" _hover={{ boxShadow: "lg" , transform: "scale(1.02)"}} transition="all 0.3s ease-in-out">
                  <Image
                    hideBelow="md"
                    objectFit="cover"
                    maxW="200px"
                    src="/ikea.jpg"
                    alt="Caffe Latte"
                  />
                  <Box>
                    <Card.Body m="3em">
                      <Heading  as="h2" pb="2em" size="2xl" style={fontLuckiestGuy}>IKEA Project</Heading>
                      <Card.Description  color="white">
                        International IT project to develop a new Web shop as well as infastructure for IKEA.
                        My Role was as defect mangager and user interface developer. During my time as a developer I worked mainly on the check out flow where we used vanilla object oriented javascript to write the frontend. The webpage has of course evolved since but is still true to the original concept so visit Ikea to get an idea of what I was part of developing.
                        <Link color="white" m="0em 1em" href="https://www.ikea.com/gb/en/shoppingcart/" target="_blank">IKEA check out flow<FaExternalLinkSquareAlt  /></Link>
                      </Card.Description>
                    </Card.Body>
                    <Card.Footer>
                    </Card.Footer>
                  </Box>
                </Card.Root>
              </GridItem>
              <GridItem rounded="lg" maxW={{smDown: "350px"}}>
                <Card.Root className="dropShadow" p="0em" mt="0" mb="4em" bg="white"  color="#2B4570" flexDirection="row" overflow="hidden" maxW="3xl" ml="auto" _hover={{ boxShadow: "lg" , transform: "scale(1.02)"}} transition="all 0.3s ease-in-out">
                  <Image
                    hideBelow="md"
                    objectFit="cover"
                    maxW="200px"
                    order="3"
                     src="/smartwatch.png"
                    alt="Caffe Latte"
                  />
                  <Box>
                    <Card.Body m="3em">
                      <Heading  as="h2" pb="2em" size="2xl" style={fontLuckiestGuy}>Smartwatch app and CMS website (personal project)</Heading>
                      <Card.Description  color="#2B4570">
                       A smartwatch app and a "CMS" site where you can configure your own quiz for your smartwatch. It was based on Java, PHP (Laravel), HTML5, semantic UI, SQL. The site is no longer online but can be found on Way back machine here: 
                       <Link color="#2B4570" href="https://web.archive.org/web/20180808002923/http://watchandspin.com/  " target="_blank" p="0em 1em">www.watchandspin.com <FaExternalLinkSquareAlt  /></Link>
                       or if you would like to view a video demonstration of the website and app its here:
                       <Link color="#2B4570" href="https://www.youtube.com/watch?v=I02Dh1zemuM" target="_blank" p="0em 1em">demo on youtube <FaExternalLinkSquareAlt  /></Link>
                       If you would like to see the code there is a link for the web repository here:
                       <Link color="#2B4570" href="https://github.com/christengc/www" target="_blank" p="0em 1em">Watchandspin website repository <FaExternalLinkSquareAlt  /></Link>
                       and the app repository here:
                        <Link color="#2B4570" href="https://github.com/christengc/Watch-IT-android-app" target="_blank" p="0em 1em">Watchandspin android app repository <FaExternalLinkSquareAlt  /></Link>
                      </Card.Description>
                    </Card.Body>
                    <Card.Footer>
                    </Card.Footer>
                  </Box>
                </Card.Root>
              </GridItem>
              <GridItem rounded="lg" maxW={{smDown: "350px"}}>
                <Card.Root className="dropShadow" p="0em" mt="0" mb="4em" bg="cyan.solid"  color="white" flexDirection="row" overflow="hidden" maxW="3xl" mr="auto" _hover={{ boxShadow: "lg" , transform: "scale(1.02)"}} transition="all 0.3s ease-in-out">
                  <Image
                    hideBelow="md"
                    objectFit="cover"
                    maxW="200px"
                     src="/sammenspil.png"
                  />
                  <Box>
                    <Card.Body m="3em">
                      <Heading  as="h2" pb="2em" size="2xl" style={fontLuckiestGuy}>Micro Volunteering App (master project)</Heading>
                      <Card.Description  color="white">
                        In 2013 I developed a HTML5 application for web and mobile called "Sammenspil.dk" it was based on Jquery, PHP, MySQL. Where people could volunteer or get help for accomplishing micro tasks.
                        <Link target="_blank" color="white" p="0em 1em" href="https://www2.imm.dtu.dk/pubdb/edoc/imm6558.pdf">Social Media Volunteering Application<FaExternalLinkSquareAlt/></Link>
                      </Card.Description>
                    </Card.Body>
                    <Card.Footer>
                    </Card.Footer>
                  </Box>
                </Card.Root>
              </GridItem>
              
        </Grid>
  )
}
