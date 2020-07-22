import React from 'react'
import markdown_it from 'markdown-it'

const md = markdown_it()

interface Props {
	txt: string
}

export const MarkdownDesription = (props: Props) => {
	const txt = md.render(props.txt)

	return (
		<div>{txt}</div>
	)
}