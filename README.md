V2Ray Tools
====

Installaction
----
```
npm -g install v2ray-tools
```

Usage
----
```
v2ray-tools [command]

Commands:
  v2ray-tools vmess2config  convert vmess url into v2ray config
  v2ray-tools poolconfig    convert subscribe url into proxy pool config

Options:
  --version  Show version number                                       [boolean]
  --help     Show help                                                 [boolean]
```
```
v2ray-tools vmess2config

convert vmess url into v2ray config

Options:
  --base     base v2ray config file path              [default: "src/base.json"]
  --url      vmess url                                                [required]
  --port     port for listen                           [number] [default: 10800]
  --listen   listen interface
```
```
v2ray-tools poolconfig

convert subscribe url into proxy pool config

Options:
  --base        base v2ray config file path           [default: "src/base.json"]
  --url         vmess url                                     [array] [required]
  --v2ray-path                                                [default: "v2ray"]
```

ProxyPool <sub>-- route by tag</sub>
----

one to one

```
{
	inbounds: [
		{
			tag: xxx
		}
	],
	inbounds: [
		{
			tag: yyy
		}
	],
	routing: {
		rules: [
			{
				inbound: xxx
				outbound: yyy
			}
		]
	}
}
```

one to many

```
{
	...
	routing: {
		rules: [
			{
				inbound: xxx
				outbound: [yyy]
			}
		]
	}
}
```

many to one

```
{
	...
	routing: {
		rules: [
			{
				inbound: [xxx]
				outbound: yyy
			}
		]
	}
}
```

many to many

```
{
	...
	routing: {
		rules: [
			{
				inbound: [xxx]
				outbound: [yyy]
			}
		]
	}
}
```

