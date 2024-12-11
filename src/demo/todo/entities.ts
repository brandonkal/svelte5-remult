import { Entity, Fields, Relations } from "remult";

function isValidURL(input: string) {
	if (typeof input !== "string") return false;
	let fallbackHost: string | undefined;
	if (input.startsWith("localhost")) input = `http://${input}` as string;
	// Handle relative paths
	if (input.startsWith("/")) fallbackHost = "http://localhost";
	// Validate absolute URLs
	try {
		const url = new URL(input, fallbackHost);
		// if we didn't throw yet, we have a valid URL but we require https or localhost
		return url.protocol === "https:" || url.origin.startsWith("http://localhost");
	} catch {
		return false;
	}
}

@Entity("modules", {
  allowApiCrud: true,
})
export class Module {
  @Fields.cuid()
  id = "";

  @Fields.string<Module, string>({
		validate: (input, context) => {
			console.log("validating url string:", input);
			if (isValidURL(input.url)) return true;
			throw new Error("Valid URLs must start with https:// or / or localhost");
		},
	})
	url = "";

  @Fields.boolean()
  completed = false;

  @Fields.createdAt()
  createdAt?: Date;

  @Relations.toOne<Module, Panel>(() => Panel)
	panel!: Panel;
}

@Entity<Panel>("panels")
export class Panel {
	@Fields.cuid()
	id!: string;

	@Fields.string()
	title = "";

	@Fields.number({ required: true, allowNull: false })
	version!: number;

	@Fields.createdAt({ allowNull: false, includeInApi: false })
	createdAt?: Date;

	@Fields.date({ allowNull: false, includeInApi: false })
	modifiedAt = new Date();

	@Relations.toMany<Panel, Module>(() => Module, { defaultIncluded: true })
	modules?: Module[];
}
