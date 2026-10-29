import config from "@payload-config";
import { NotFoundPage } from "@payloadcms/next/views";
import type { Metadata } from "next";

import { importMap } from "../importMap.js";

type Props = {
  params: Promise<{ segments: string[] }>;
  searchParams: Promise<{ [key: string]: string | string[] }>;
};

export const generateMetadata = (): Promise<Metadata> =>
  Promise.resolve({ title: "Not found" });

const NotFound = ({ params, searchParams }: Props) =>
  NotFoundPage({ config, importMap, params, searchParams });

export default NotFound;
