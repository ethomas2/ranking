import typing as t


class Election(t.TypedDict):
    id: str
    body: t.List[t.List[str]]
    header: t.List[str]
    leftCol: t.List[str]
    title: str
    version: str
