import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import * as React from "react";

interface EmailTemplateProps {
  confirmLink: string;
}

const baseUrl = process.env.NEXT_PUBLIC_URL;

export const ResetPasswordEmail = ({ confirmLink }: EmailTemplateProps) => {
  const previewText = "Reset your password";

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans px-2">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[465px]">
            <Section className="mt-[32px]">
              <Img
                src={`${baseUrl}assets/plura-logo.svg`}
                width="40"
                height="37"
                alt="jamly"
                className="my-0 mx-auto"
              />
            </Section>
            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              Reset your password
            </Heading>
            <Text className="text-black text-[14px] leading-[24px]">
              Hello,
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              Click the button below to reset your password.
            </Text>
            <Section>
              <Row>
                <Column align="center">
                  <Img
                    src={`${baseUrl}reset.png`}
                    width="64"
                    height="64"
                    alt="verify"
                  />
                </Column>
              </Row>
            </Section>
            <Section className="text-center mt-[32px] mb-[32px]">
              <Button
                className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                href={confirmLink}
              >
                Reset password
              </Button>
            </Section>
            <Text className="text-black text-[14px] leading-[24px]">
              or copy and paste this URL into your browser:{" "}
              <Link href={confirmLink} className="text-blue-600 no-underline">
                {confirmLink}
              </Link>
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              Please ignore this email if you did not initiate the request.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};
