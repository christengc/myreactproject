import { Timeline, Stack, Button, Popover, Portal, Text, Image, Container, Heading, Center } from "@chakra-ui/react";

export default function Cv() {
  return (
        <Container className="dropShadow" bg="white" color="#2B4570" borderColor="gray.300" borderWidth="2px" borderRadius="8px" m="2em 0em" pt="2em" pr="auto" pl="auto">
        <Heading as="h2" pb="2em" size="2xl">Curriculum vitae</Heading>
        <Center>
        <Stack gap="8" pt="2em" pl="1em">
          <Timeline.Root size="xl">

            <Timeline.Item height="6em" >
              <Timeline.Content width="auto">
                <Timeline.Title whiteSpace="nowrap" fontFamily={ "'Courier New', monospace" } fontWeight={600} >2002 - 2003</Timeline.Title>
              </Timeline.Content>
              <Timeline.Connector>
                <Timeline.Separator borderWidth={2} />
                <Timeline.Indicator  bg="red.solid" color="black"></Timeline.Indicator>
              </Timeline.Connector>
              <Timeline.Content>
                <Timeline.Title verticalAlign="top"  mt="2px">
                  Forsvaret - Military service at Kongelige artilleri
                      <Popover.Root>
                        <Popover.Trigger asChild>
                          <Button size="2xs" variant="subtle" rounded="full" mr="0" ml="auto">
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

            <Timeline.Item height="6em" >
              <Timeline.Content width="auto">
                <Timeline.Title whiteSpace="nowrap" fontFamily={ "'Courier New', monospace" } fontWeight={600}>2004 - 2008</Timeline.Title>
              </Timeline.Content>
              <Timeline.Connector>
                <Timeline.Separator borderWidth={2}/>
                <Timeline.Indicator  bg="red.solid" color="black"></Timeline.Indicator>
              </Timeline.Connector>
              <Timeline.Content>
                <Timeline.Title mt="2px">
                  DTU - Bachelor Electro engineering
                                        <Popover.Root>
                        <Popover.Trigger asChild>
                          <Button size="2xs" variant="subtle" rounded="full" mr="0" ml="auto">
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

             <Timeline.Item height="6em" >
              <Timeline.Content width="auto">
                <Timeline.Title whiteSpace="nowrap" fontFamily={ "'Courier New', monospace" } fontWeight={600}>2008 - 2009</Timeline.Title>
              </Timeline.Content>
              <Timeline.Connector>
                <Timeline.Separator borderWidth={2}/>
                <Timeline.Indicator  bg="green.solid" color="black"></Timeline.Indicator>
              </Timeline.Connector>
              <Timeline.Content>
                <Timeline.Title mt="2px">
                  Private - Tutor in Math, Physics at highscool level 
                                        <Popover.Root>
                        <Popover.Trigger asChild>
                          <Button size="2xs" variant="subtle" rounded="full" mr="0" ml="auto">
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

             <Timeline.Item height="6em" >
              <Timeline.Content width="auto">
                <Timeline.Title whiteSpace="nowrap" fontFamily={ "'Courier New', monospace" } fontWeight={600}>2008 - 2010</Timeline.Title>
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
                          <Button size="2xs" variant="subtle" rounded="full" mr="0" ml="auto">
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

            <Timeline.Item height="6em" >
              <Timeline.Content width="auto">
                <Timeline.Title whiteSpace="nowrap" fontFamily={ "'Courier New', monospace" } fontWeight={600}>2010 - 2013</Timeline.Title>
              </Timeline.Content>
              <Timeline.Connector>
                <Timeline.Separator borderWidth={2}/>
                <Timeline.Indicator bg="red.solid" color="black"></Timeline.Indicator>
              </Timeline.Connector>
              <Timeline.Content>
                <Timeline.Title mt="2px">
                  DTU - M.SC. Digital Media Engineering
                                        <Popover.Root>
                        <Popover.Trigger asChild>
                          <Button size="2xs" variant="subtle" rounded="full"  mr="0" ml="auto">
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

            <Timeline.Item height="6em" >
              <Timeline.Content width="auto">
                <Timeline.Title whiteSpace="nowrap" fontFamily={ "'Courier New', monospace" } fontWeight={600}>2011 -  2013</Timeline.Title>
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
                          <Button size="2xs" variant="subtle" rounded="full"  mr="0" ml="auto">
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

            <Timeline.Item height="6em" >
              <Timeline.Content width="auto">
                <Timeline.Title whiteSpace="nowrap" fontFamily={ "'Courier New', monospace" } fontWeight={600}>2011 - 2014</Timeline.Title>
              </Timeline.Content>
              <Timeline.Connector>
                <Timeline.Separator borderWidth={2}/>
                <Timeline.Indicator bg="green.solid" color="black"></Timeline.Indicator>
              </Timeline.Connector>
              <Timeline.Content>
                <Timeline.Title mt="2px">
                  Volunteer at Transmogriffen
                                        <Popover.Root>
                        <Popover.Trigger asChild>
                          <Button size="2xs" variant="subtle" rounded="full"  mr="0" ml="auto">
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

            <Timeline.Item height="6em" >
              <Timeline.Content width="auto">
                <Timeline.Title whiteSpace="nowrap" fontFamily={ "'Courier New', monospace" } fontWeight={600}>2013 -  2016</Timeline.Title>
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
                          <Button size="2xs" variant="subtle" rounded="full"  mr="0" ml="auto">
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

            <Timeline.Item height="6em" >
              <Timeline.Content width="auto">
                <Timeline.Title whiteSpace="nowrap" fontFamily={ "'Courier New', monospace" } fontWeight={600}>2016 - xxxx </Timeline.Title>
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
                          <Button size="2xs" variant="subtle" rounded="full"  mr="0" ml="auto">
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

            <Timeline.Item height="6em" >
              <Timeline.Content width="auto">
                <Timeline.Title whiteSpace="nowrap" fontFamily={ "'Courier New', monospace" } fontWeight={600}>2017 - 2019</Timeline.Title>
              </Timeline.Content>
              <Timeline.Connector>
                <Timeline.Separator borderWidth={2}/>
                <Timeline.Indicator bg="red.solid" color="black"></Timeline.Indicator>
              </Timeline.Connector>
              <Timeline.Content>
                <Timeline.Title mt="2px">
                  CBS - Graduate diploma in Business Administration
                                        <Popover.Root>
                        <Popover.Trigger asChild>
                          <Button size="2xs" variant="subtle" rounded="full">
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
    </Container>
  )
}
