<script lang="ts">
	import { repo } from 'remult'
	import { Task } from './Task'
	import Tile from '../Tile.svelte'

	let formError = $state('')

	let tasks: Task[] = $state([])
	let hideCompleted = $state(false)
	function toggleHideCompleted() {
		hideCompleted = !hideCompleted
	}

	$effect(() => {
		repo(Task)
			.find({
				where: {
					completed: hideCompleted ? false : undefined,
				},
				orderBy: {
					createdAt: 'desc',
				},
			})
			.then((_tasks) => {
				tasks = _tasks
			})
	})

	// let newTaskTitle = $state('')
	let editingTask = $state(new Task())

	const addTask = async (event: Event) => {
		event.preventDefault()
		try {
			const newTask = await repo(Task).insert(editingTask)
			tasks = [...tasks, newTask]
			editingTask = new Task()
			formError = ''
		} catch (error) {
			formError = (error as { message: string }).message
		}
	}

	const setCompleted = async (task: Task, completed: boolean) => {
		return await repo(Task).update(task.id, { completed })
	}

	const deleteTask = async (task: Task) => {
		await repo(Task).delete(task)
		tasks = tasks.filter((c) => c.id !== task.id)
	}
</script>

<Tile
	title="Todos"
	subtitle="Enter a URL"
	icon=""
	width="full"
	className="todo"
	status="Info"
>
	<main>
		<form onsubmit={addTask}>
			<input
				bind:value={editingTask.url}
				placeholder="What needs to be done?"
				type="text"
			/>
			<button type="submit">
				<img src="plus.svg" alt="Add" />
			</button>
		</form>
		{#if formError.length > 0}
			{formError}
		{/if}
		{#each tasks as task, i}
			<div class="todo__task {task.completed ? 'completed' : ''}">
				<input
					id={task.id}
					type="checkbox"
					bind:checked={task.completed}
					oninput={async (e) => {
						tasks[i] = await setCompleted(task, e.currentTarget.checked)
					}}
				/>
				<span>
					<label for={task.id}>{task.url}</label>
				</span>
				<button onclick={() => deleteTask(task)}>
					<img src="trash.svg" alt="Delete" />
				</button>
			</div>
		{/each}
	</main>
	<div class="button-row">
		<button onclick={toggleHideCompleted}>
			{hideCompleted ? 'Show' : 'Hide'} completed
		</button>
	</div>
</Tile>
