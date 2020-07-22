import React, {FC} from 'react'
import { Link as ReactRouterLink, LinkProps } from "react-router-dom"
import { Link as ReactMDLink } from "@react-md/link"

export const Link: FC<LinkProps> = (props) => (
	<ReactMDLink component={ReactRouterLink} {...props} />
)