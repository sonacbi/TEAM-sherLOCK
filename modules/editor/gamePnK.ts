class ClassVersion {
    static this_version = "0.0.1";          // 버전
    version = ClassVersion.this_version;    // 모든 클래스에 부여하는 버전
}

// 포인트 앤 클릭 게임
class GamePnK extends ClassVersion {
    room: Room[];
    constructor({
        room = [new Room({})],
    }) {
        super();
        this.room = room.map(data => data);
    }
}

// 방
class Room extends ClassVersion {
    name: string;
    timeLimit: number;
    isOpened: boolean;
    side: Side[];
    constructor({
        name = '',
        timeLimit = 0,
        isOpened = true,
        side = [new Side({})]
    }) {
        super();
        this.name = name;
        this.timeLimit = timeLimit;
        this.isOpened = isOpened;
        this.side = side.map(data => new Side(data));
    }
}

// 방의 방향 | 면
class Side extends ClassVersion {
    name: string;
    description: string;
    frame: Frame;
    fabric: Fabric;
    constructor({
        name = '',
        description = '',
        frame = new Frame({}),
        fabric = new Fabric({}),
    }) {
        super();
        this.name = name;
        this.description = description;
        this.frame = frame;
        this.fabric = fabric;
    }
}

// 방의 골자
class Frame extends ClassVersion {
    x: number;
    y: number;
    width: number;
    height: number;
    angle: number;
    top: number;
    left: number;
    right: number;
    bottom: number;
    constructor({
        x = 220,
        y = 120,
        width = 220 + 440,
        height = 120 + 330,
        angle = 0,
        top = 0,
        left = 0,
        right = 0,
        bottom = 0,
    }) {
        super();
        this.x = Math.round(x);
        this.y = Math.round(y);
        this.width = Math.round(width);
        this.height = Math.round(height);
        this.angle = Number(angle.toFixed(1));
        this.top = top;
        this.left = left;
        this.right = right;
        this.bottom = bottom;
    }
}

// 도형
enum FabricType {
    rect = "rect",
    circle = "circle",
    triangle = "triangle",
    polygon = "polygon",
    line = "line",
    textBox = "textBox",
    image = "image",
    // (custom)
}
class Fabric extends ClassVersion {
    name: string;
    type: FabricType;
    option: Object;
    event: Object;
    constructor({
        name = '',
        type = FabricType.rect,
        option = {},
        event = {},
    }) {
        super();
        this.name = name;
        this.type = type;
        this.option = option;
        this.event = event;
    }
}

// 아이템
class Item extends ClassVersion {
    name: string;
    description: string;
    type: string;
    iconPath: string;
    imgPath: string;
    quantity: number;
    getItemMessage: string;
    uniteItem: string[];
    fabric: Fabric;
    constructor({
        name = '',
        description = '',
        type = '',
        iconPath = '',
        imgPath = '',
        quantity = 1,
        getItemMessage = null,
        uniteItem = [],
        fabric = new Fabric({}),
    }) {
        super()
        this.name = name;
        this.description = description;
        this.type = type;
        this.iconPath = iconPath;
        this.imgPath = imgPath;
        this.quantity = quantity;
        this.getItemMessage = getItemMessage;
        this.uniteItem = uniteItem;
        this.fabric = fabric || new Fabric({name})
    }
}