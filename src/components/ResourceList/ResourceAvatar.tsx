import React from 'react'
import {Avatar} from 'react-md'
//../../thirdparty/mastercomfig.github.io/img/mastercomfig_logo.svg
const src = 'url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDQ4IDIwNDgiPjxkZWZzPjxzdHlsZT4uYXtmaWxsOiMyMDk2ODg7fS5ie29wYWNpdHk6MTt9LmN7ZmlsbDpub25lO3N0cm9rZTojYjJkZmRiO3N0cm9rZS1taXRlcmxpbWl0OjEwO3N0cm9rZS13aWR0aDo5MnB4O308L3N0eWxlPjwvZGVmcz48dGl0bGU+bWFzdGVyY29tZmlnPC90aXRsZT48cmVjdCBjbGFzcz0iYSIgd2lkdGg9IjIwNDgiIGhlaWdodD0iMjA0OCIvPjxnIGNsYXNzPSJiIj48Y2lyY2xlIGNsYXNzPSJjIiBjeD0iMTAyNCIgY3k9IjEwMjQiIHI9IjUxMiIvPjxwYXRoIGNsYXNzPSJjIiBkPSJNMTc5MiwxMDI0YzAsNDI0LTM0NCw3NjgtNzY4LDc2OFMyNTYsMTQ0OCwyNTYsMTAyNCw2MDAsMjU2LDEwMjQsMjU2Ii8+PGxpbmUgY2xhc3M9ImMiIHgxPSIxNzkyIiB5MT0iMTAyNCIgeDI9IjE3OTIiIHkyPSIxODYyIi8+PGxpbmUgY2xhc3M9ImMiIHgxPSIyNTYiIHkxPSIxMDI0IiB4Mj0iMjU2IiB5Mj0iMTg2MiIvPjwvZz48L3N2Zz4=")'

interface Props {
	txt: string
}

export const ResourceAvatar = (props:Props) => {
	return (
		<Avatar>
			<div style={{'background': src}}>{props.txt ?? ''}</div>
		</Avatar>
	)
}