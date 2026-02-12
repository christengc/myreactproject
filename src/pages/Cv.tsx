import { Timeline, Stack, Button, Box, Popover, Portal, Text, Image, Container, Heading, Center, Span } from "@chakra-ui/react";

const fontLuckiestGuy = {
  fontFamily: 'LuckiestGuy'
}

export default function Cv() {
  return (
        <Container>
        <Box  className="dropShadow">
        <Heading as="h2" pb="2em" size="2xl" style={fontLuckiestGuy}>Curriculum vitae</Heading>
        <Center>
        <Stack gap="8" pt="2em" pl="1em">
          <Timeline.Root size="xl">

            <Timeline.Item height="9em" >
              <Timeline.Content width="auto">
                <Timeline.Title whiteSpace="nowrap" fontWeight={700} >2002 - 2003</Timeline.Title>
              </Timeline.Content>
              <Timeline.Connector>
                <Timeline.Separator borderWidth={2} />
                <Timeline.Indicator  bg="cyan.solid" color="black"></Timeline.Indicator>
              </Timeline.Connector>
              <Timeline.Content>
                <Timeline.Title verticalAlign="top"  mt="2px">
                  Forsvaret - Military service at Kongelige artilleri
                      <Popover.Root>
                        <Popover.Trigger asChild>
                          <Button size="2xs" color="#2B4570" variant="subtle" rounded="full" m="0.25em" ml="auto">
                            Read more                          
                          </Button>
                        </Popover.Trigger>
                        <Portal>
                          <Popover.Positioner>
                            <Popover.Content>
                              <Popover.Arrow />
                              <Popover.Body m="1em">
                                <Popover.Title fontWeight="medium">Forsvaret - Military service at Kongelige artilleri</Popover.Title>
                                <Text mt="1em">
                                  9 Months of Military service at Sjælsmark kasserne. Learning to survice outdoors, use weapons and collaborate and perform under pressure.
                                  <Image mt="1em" src="/forsvar.jpg"></Image>
                                </Text>
                              </Popover.Body>
                            </Popover.Content>
                          </Popover.Positioner>
                        </Portal>
                      </Popover.Root>
                </Timeline.Title>
              </Timeline.Content>
            </Timeline.Item>

            <Timeline.Item height="9em" >
              <Timeline.Content width="auto">
                <Timeline.Title whiteSpace="nowrap" fontWeight={700}>2004 - 2008</Timeline.Title>
              </Timeline.Content>
              <Timeline.Connector>
                <Timeline.Separator borderWidth={2}/>
                <Timeline.Indicator  bg="cyan.solid" color="black"></Timeline.Indicator>
              </Timeline.Connector>
              <Timeline.Content>
                <Timeline.Title mt="2px">
                  DTU - Bachelor Electro engineering
                                        <Popover.Root>
                        <Popover.Trigger asChild>
                          <Button size="2xs" color="#2B4570" variant="subtle" rounded="full" m="0.25em" ml="auto">
                            Read more                          
                          </Button>
                        </Popover.Trigger>
                        <Portal>
                          <Popover.Positioner>
                            <Popover.Content>
                              <Popover.Arrow />
                              <Popover.Body m="1em">
                                <Popover.Title fontWeight="bold">DTU - Bachelor Electro engineering</Popover.Title>
                                <Stack>
                                  <Text fontWeight="semibold" mt="1em" >Competencies:</Text> 
                                  <Text>
                                  Mathematics, programming, electronics, regulation, signal processing, image analysis, machine learning.
                                </Text>  
                                <Text fontWeight="semibold">Bachelor project:</Text>
                                <Text>
                                   Written in collaboration with Videometer A/S. Used a method called optical flow to implement a distance measurement in a company product "VideometerLab”. 
                                </Text>
                                <Text fontWeight="semibold">Internship:</Text><Span>at Videometer A/S.</Span>
                                  <Image mt="1em" ml="auto" mr="auto" height="8em" src="/dtu.png"></Image>
                                
                                </Stack>
                              </Popover.Body>
                            </Popover.Content>
                          </Popover.Positioner>
                        </Portal>
                      </Popover.Root>
                </Timeline.Title>
              </Timeline.Content>
            </Timeline.Item>

             <Timeline.Item height="9em" >
              <Timeline.Content width="auto">
                <Timeline.Title whiteSpace="nowrap" fontWeight={700}>2008 - 2009</Timeline.Title>
              </Timeline.Content>
              <Timeline.Connector>
                <Timeline.Separator borderWidth={2}/>
                <Timeline.Indicator  bg="cyan.solid" color="black"></Timeline.Indicator>
              </Timeline.Connector>
              <Timeline.Content>
                <Timeline.Title mt="2px">
                  Private - Tutor in Math, Physics at highscool level 
                                        <Popover.Root>
                        <Popover.Trigger asChild>
                          <Button size="2xs" color="#2B4570" variant="subtle" rounded="full" m="0.25em" ml="auto">
                            Read more                          
                          </Button>
                        </Popover.Trigger>
                        <Portal>
                          <Popover.Positioner>
                            <Popover.Content>
                              <Popover.Arrow />
                              <Popover.Body>
                                <Popover.Title fontWeight="medium">Private - Tutor in Math, Physics at highscool level</Popover.Title>
                                <Text mt="1em">
                                  For a period of two years, I was a tutor for 2 boys. I taught mathematics and physics.
I taught both at primary and high school level. A large part of the job was to motivate and understand the students.

                                  <Image mt="1em" src="/tutor.jpg"></Image>
                                </Text>
                              </Popover.Body>
                            </Popover.Content>
                          </Popover.Positioner>
                        </Portal>
                      </Popover.Root>
                </Timeline.Title>
              </Timeline.Content>
            </Timeline.Item>

             <Timeline.Item height="9em" >
              <Timeline.Content width="auto">
                <Timeline.Title whiteSpace="nowrap" fontWeight={700}>2008 - 2010</Timeline.Title>
              </Timeline.Content>
              <Timeline.Connector>
                <Timeline.Separator borderWidth={2}/>
                <Timeline.Indicator  bg="cyan.solid" color="black"></Timeline.Indicator>
              </Timeline.Connector>
              <Timeline.Content>
                <Timeline.Title mt="2px">
                  T.Smedegaard - Project Engineer
                                        <Popover.Root>
                        <Popover.Trigger asChild>
                          <Button size="2xs" color="#2B4570" variant="subtle" rounded="full" m="0.25em" ml="auto">
                            Read more                          
                          </Button>
                        </Popover.Trigger>
                        <Portal>
                          <Popover.Positioner>
                            <Popover.Content>
                              <Popover.Arrow />
                              <Popover.Body>
                                <Popover.Title fontWeight="medium">T.Smedegaard - Project Engineer</Popover.Title>
                                <Text mt="1em">
                                  Developed a new series of energy-efficient circulation pumps.
Responsible for software development, testing, subcontractors, and production equipment.
Conducted performance tests and user communication. Technical focus was on signal processing, c programming, microchips, performance programming. 

                                  <Image mt="1em" src="/smedegaard.png"></Image>
                                </Text>
                              </Popover.Body>
                            </Popover.Content>
                          </Popover.Positioner>
                        </Portal>
                      </Popover.Root>
                </Timeline.Title>
              </Timeline.Content>
            </Timeline.Item>

            <Timeline.Item height="9em" >
              <Timeline.Content width="auto">
                <Timeline.Title whiteSpace="nowrap" fontWeight={700}>2010 - 2013</Timeline.Title>
              </Timeline.Content>
              <Timeline.Connector>
                <Timeline.Separator borderWidth={2}/>
                <Timeline.Indicator bg="cyan.solid" color="black"></Timeline.Indicator>
              </Timeline.Connector>
              <Timeline.Content>
                <Timeline.Title mt="2px">
                  DTU - M.SC. Digital Media Engineering
                                        <Popover.Root>
                        <Popover.Trigger asChild>
                          <Button size="2xs" color="#2B4570" variant="subtle" rounded="full"  m="0.25em" ml="auto">
                            Read more                          
                          </Button>
                        </Popover.Trigger>
                        <Portal>
                          <Popover.Positioner>
                            <Popover.Content>
                              <Popover.Arrow />
                              <Popover.Body>
                                <Popover.Title fontWeight="medium">Forsvaret - Military service at Kongelige artilleri</Popover.Title>
                                <Text>
                                  Competencies: image analysis , Business models, Project management, User experience engineering, entrepreneurship, programming, mobile applications, web technologies.
Master project: Social media volunteering application http://www2.imm.dtu.dk/pubdb/views/edoc_download.php/6558/pdf/imm6558.pdf

                                  <Image src="/dtu.png"></Image>
                                </Text>
                              </Popover.Body>
                            </Popover.Content>
                          </Popover.Positioner>
                        </Portal>
                      </Popover.Root>
                </Timeline.Title>
              </Timeline.Content>
            </Timeline.Item>

            <Timeline.Item height="9em" >
              <Timeline.Content width="auto">
                <Timeline.Title whiteSpace="nowrap" fontWeight={700}>2011 -  2013</Timeline.Title>
              </Timeline.Content>
              <Timeline.Connector>
                <Timeline.Separator borderWidth={2}/>
                <Timeline.Indicator bg="cyan.solid" color="black"></Timeline.Indicator>
              </Timeline.Connector>
              <Timeline.Content>
                <Timeline.Title mt="2px">
                  NNIT - IT Consultant
                                        <Popover.Root>
                        <Popover.Trigger asChild>
                          <Button size="2xs" color="#2B4570" variant="subtle" rounded="full"  m="0.25em" ml="auto">
                            Read more                          
                          </Button>
                        </Popover.Trigger>
                        <Portal>
                          <Popover.Positioner>
                            <Popover.Content>
                              <Popover.Arrow />
                              <Popover.Body>
                                <Popover.Title fontWeight="medium">Forsvaret - Military service at Kongelige artilleri</Popover.Title>
                                <Text>
                                  xxx...
                                  <Image src="/placeholder.jpg"></Image>
                                </Text>
                              </Popover.Body>
                            </Popover.Content>
                          </Popover.Positioner>
                        </Portal>
                      </Popover.Root>
                </Timeline.Title>
              </Timeline.Content>
            </Timeline.Item>

            <Timeline.Item height="9em" >
              <Timeline.Content width="auto">
                <Timeline.Title whiteSpace="nowrap" fontWeight={700}>2011 - 2014</Timeline.Title>
              </Timeline.Content>
              <Timeline.Connector>
                <Timeline.Separator borderWidth={2}/>
                <Timeline.Indicator bg="cyan.solid" color="black"></Timeline.Indicator>
              </Timeline.Connector>
              <Timeline.Content>
                <Timeline.Title mt="2px">
                  Volunteer at Transmogriffen
                                        <Popover.Root>
                        <Popover.Trigger asChild>
                          <Button size="2xs" color="#2B4570" variant="subtle" rounded="full"  m="0.25em" ml="auto">
                            Read more                          
                          </Button>
                        </Popover.Trigger>
                        <Portal>
                          <Popover.Positioner>
                            <Popover.Content>
                              <Popover.Arrow />
                              <Popover.Body>
                                <Popover.Title fontWeight="medium">Forsvaret - Military service at Kongelige artilleri</Popover.Title>
                                <Text>
                                  xxx...
                                  <Image src="/placeholder.jpg"></Image>
                                </Text>
                              </Popover.Body>
                            </Popover.Content>
                          </Popover.Positioner>
                        </Portal>
                      </Popover.Root>
                </Timeline.Title>
              </Timeline.Content>
            </Timeline.Item>

            <Timeline.Item height="9em" >
              <Timeline.Content width="auto">
                <Timeline.Title whiteSpace="nowrap" fontWeight={700}>2013 -  2016</Timeline.Title>
              </Timeline.Content>
              <Timeline.Connector>
                <Timeline.Separator borderWidth={2}/>
                <Timeline.Indicator bg="cyan.solid" color="black"></Timeline.Indicator>
              </Timeline.Connector>
              <Timeline.Content>
                <Timeline.Title mt="2px">
                  IBM - Senior IT Consultant
                                        <Popover.Root>
                        <Popover.Trigger asChild>
                          <Button size="2xs" color="#2B4570" variant="subtle" rounded="full"  m="0.25em" ml="auto">
                            Read more                          
                          </Button>
                        </Popover.Trigger>
                        <Portal>
                          <Popover.Positioner>
                            <Popover.Content>
                              <Popover.Arrow />
                              <Popover.Body>
                                <Popover.Title fontWeight="medium">Forsvaret - Military service at Kongelige artilleri</Popover.Title>
                                <Text>
                                  xxx...
                                  <Image src="/placeholder.jpg"></Image>
                                </Text>
                              </Popover.Body>
                            </Popover.Content>
                          </Popover.Positioner>
                        </Portal>
                      </Popover.Root>
                </Timeline.Title>
              </Timeline.Content>
            </Timeline.Item>

            <Timeline.Item height="9em" >
              <Timeline.Content width="auto">
                <Timeline.Title whiteSpace="nowrap" fontWeight={700}>2016 - xxxx </Timeline.Title>
              </Timeline.Content>
              <Timeline.Connector>
                <Timeline.Separator borderWidth={2}/>
                <Timeline.Indicator bg="cyan.solid" color="black"></Timeline.Indicator>
              </Timeline.Connector>
              <Timeline.Content>
                <Timeline.Title mt="2px">
                  Nordea - Multiple roles.
                                        <Popover.Root>
                        <Popover.Trigger asChild>
                          <Button size="2xs" color="#2B4570" variant="subtle" rounded="full"  m="0.25em" ml="auto">
                            Read more                          
                          </Button>
                        </Popover.Trigger>
                        <Portal>
                          <Popover.Positioner>
                            <Popover.Content>
                              <Popover.Arrow />
                              <Popover.Body>
                                <Popover.Title fontWeight="medium">Forsvaret - Military service at Kongelige artilleri</Popover.Title>
                                <Text>
                                  xxx...
                                  <Image src="/placeholder.jpg"></Image>
                                </Text>
                              </Popover.Body>
                            </Popover.Content>
                          </Popover.Positioner>
                        </Portal>
                      </Popover.Root>
                </Timeline.Title>
              </Timeline.Content>
            </Timeline.Item>

            <Timeline.Item height="9em" >
              <Timeline.Content width="auto">
                <Timeline.Title whiteSpace="nowrap" fontWeight={700}>2017 - 2019</Timeline.Title>
              </Timeline.Content>
              <Timeline.Connector>
                <Timeline.Separator borderWidth={2}/>
                <Timeline.Indicator bg="cyan.solid" color="black"></Timeline.Indicator>
              </Timeline.Connector>
              <Timeline.Content>
                <Timeline.Title mt="2px">
                  CBS - Graduate diploma in Business Administration
                                        <Popover.Root>
                        <Popover.Trigger asChild>
                          <Button size="2xs" color="#2B4570" variant="subtle" rounded="full">
                            Read more                          
                          </Button>
                        </Popover.Trigger>
                        <Portal>
                          <Popover.Positioner>
                            <Popover.Content>
                              <Popover.Arrow />
                              <Popover.Body>
                                <Popover.Title fontWeight="medium">Forsvaret - Military service at Kongelige artilleri</Popover.Title>
                                <Text>
                                  xxx...
                                  <Image src="/placeholder.jpg"></Image>
                                </Text>
                              </Popover.Body>
                            </Popover.Content>
                          </Popover.Positioner>
                        </Portal>
                      </Popover.Root>
                </Timeline.Title>
              </Timeline.Content>
            </Timeline.Item>

          </Timeline.Root>
    </Stack>
    </Center>
    </Box>
    </Container>
  )
}
