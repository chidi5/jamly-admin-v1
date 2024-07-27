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

export const TwoFactorEmail = ({ confirmLink }: EmailTemplateProps) => {
  const previewText = "Two factor authentication";

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
              Verification code
            </Heading>
            <Text className="text-black text-[14px] leading-[24px]">
              Enter the following verification code when prompted.
            </Text>
            <Section className="mb-[32px]">
              <Row>
                <Column align="center">
                  <Text className="text-black text-3xl">
                    <strong>{confirmLink}</strong>
                  </Text>
                </Column>
              </Row>
            </Section>
            <Text className="text-black text-[14px] leading-[24px]">
              To protect your account, do not share this code.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};
