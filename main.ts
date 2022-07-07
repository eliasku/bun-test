import * as fs from "bun:fs"
import * as path from "bun:path"
import {SHA1} from "bun"

let files_total = 0;
let files_loaded = 0;

function ensureDirSync(filepath: string) {
    if (!fs.existsSync(filepath)) {
        fs.mkdirSync(filepath, {recursive: true});
    }
}

/** Download file from url to the destination. */
export async function download(url: string, filepath: string): Promise<void> {
    ++files_total;
    const response = await fetch(url, {redirect: "follow"});
    if (response.status !== 200) {
        throw new Error(`HTTP error: status ${response.status}-'${response.statusText}' received instead of 200`);
    }
    // TODO: enable write files
    // const buffer = await response.arrayBuffer();
    //ensureDirSync(path.dirname(filepath));
    //fs.writeFileSync(filepath, buffer);
    ++files_loaded;
    console.log(`download completed [${files_loaded}/${files_total}]: ${url}`);
}

export interface DownloadOptions {
    srcBaseUrl: string;
    // destination path, `process.cwd` if not defined
    destPath?: string;
    fileMap?: { [key: string]: string };
    fileList?: string[];
}

export async function downloadFiles(props: DownloadOptions) {
    const srcBaseUrl = props.srcBaseUrl;
    const destPath = props.destPath ?? process.cwd();
    const fileMap = props.fileMap ?? {};
    const fileList = props.fileList ?? [];
    const baseUrl = new URL(srcBaseUrl);

    const tasks = [];

    for (const src of Object.keys(fileMap)) {
        const dest = fileMap[src] ?? src;
        const destFilePath = path.join(destPath, dest);
        const url = baseUrl.protocol + "//" + baseUrl.host + path.join(baseUrl.pathname, src);
        tasks.push(download(url, destFilePath));
    }

    for (const src of fileList) {
        const destFilePath = path.join(destPath, src);
        const url = baseUrl.protocol + "//" + baseUrl.host + path.join(baseUrl.pathname, src);
        tasks.push(download(url, destFilePath));
    }

    for(const task of tasks) await task;
    // TODO: enable parallel downloading
    //await Promise.all(tasks);
}

export async function downloadCheck(url: string, destDir: string, sha1: string) {
    const name = path.basename(url);
    const archivePath = path.join(destDir, name);
    if (fs.existsSync(archivePath)) {
        const file = fs.readFileSync(archivePath);
        const sha1sum = SHA1.hash(file, "hex");
        console.log(`Found file ${path.basename(archivePath)}, SHA1: ${sha1sum}`);
        if (sha1sum === sha1) {
            console.info("Check SHA1 verified, skip downloading", name);
            return;
        }
    }
    await download(url, archivePath);
}

const __dirname = import.meta.dir;

await downloadFiles({
    srcBaseUrl: "https://github.com/erincatto/box2d/raw/main",
    destPath: __dirname,
    fileList: [
        // Source files
        "src/collision/b2_broad_phase.cpp",
        "src/collision/b2_chain_shape.cpp",
        "src/collision/b2_circle_shape.cpp",
        "src/collision/b2_collide_circle.cpp",
        "src/collision/b2_collide_edge.cpp",
        "src/collision/b2_collide_polygon.cpp",
        "src/collision/b2_collision.cpp",
        "src/collision/b2_distance.cpp",
        "src/collision/b2_dynamic_tree.cpp",
        "src/collision/b2_edge_shape.cpp",
        "src/collision/b2_polygon_shape.cpp",
        "src/collision/b2_time_of_impact.cpp",
        "src/common/b2_block_allocator.cpp",
        "src/common/b2_draw.cpp",
        "src/common/b2_math.cpp",
        "src/common/b2_settings.cpp",
        "src/common/b2_stack_allocator.cpp",
        "src/common/b2_timer.cpp",
        "src/dynamics/b2_body.cpp",
        "src/dynamics/b2_chain_circle_contact.cpp",
        "src/dynamics/b2_chain_circle_contact.h",
        "src/dynamics/b2_chain_polygon_contact.cpp",
        "src/dynamics/b2_chain_polygon_contact.h",
        "src/dynamics/b2_circle_contact.cpp",
        "src/dynamics/b2_circle_contact.h",
        "src/dynamics/b2_contact.cpp",
        "src/dynamics/b2_contact_manager.cpp",
        "src/dynamics/b2_contact_solver.cpp",
        "src/dynamics/b2_contact_solver.h",
        "src/dynamics/b2_distance_joint.cpp",
        "src/dynamics/b2_edge_circle_contact.cpp",
        "src/dynamics/b2_edge_circle_contact.h",
        "src/dynamics/b2_edge_polygon_contact.cpp",
        "src/dynamics/b2_edge_polygon_contact.h",
        "src/dynamics/b2_fixture.cpp",
        "src/dynamics/b2_friction_joint.cpp",
        "src/dynamics/b2_gear_joint.cpp",
        "src/dynamics/b2_island.cpp",
        "src/dynamics/b2_island.h",
        "src/dynamics/b2_joint.cpp",
        "src/dynamics/b2_motor_joint.cpp",
        "src/dynamics/b2_mouse_joint.cpp",
        "src/dynamics/b2_polygon_circle_contact.cpp",
        "src/dynamics/b2_polygon_circle_contact.h",
        "src/dynamics/b2_polygon_contact.cpp",
        "src/dynamics/b2_polygon_contact.h",
        "src/dynamics/b2_prismatic_joint.cpp",
        "src/dynamics/b2_pulley_joint.cpp",
        "src/dynamics/b2_revolute_joint.cpp",
        "src/dynamics/b2_weld_joint.cpp",
        "src/dynamics/b2_wheel_joint.cpp",
        "src/dynamics/b2_world.cpp",
        "src/dynamics/b2_world_callbacks.cpp",
        "src/rope/b2_rope.cpp",

        // Headers
        "include/box2d/b2_api.h",
        "include/box2d/b2_block_allocator.h",
        "include/box2d/b2_body.h",
        "include/box2d/b2_broad_phase.h",
        "include/box2d/b2_chain_shape.h",
        "include/box2d/b2_circle_shape.h",
        "include/box2d/b2_collision.h",
        "include/box2d/b2_common.h",
        "include/box2d/b2_contact.h",
        "include/box2d/b2_contact_manager.h",
        "include/box2d/b2_distance.h",
        "include/box2d/b2_distance_joint.h",
        "include/box2d/b2_draw.h",
        "include/box2d/b2_dynamic_tree.h",
        "include/box2d/b2_edge_shape.h",
        "include/box2d/b2_fixture.h",
        "include/box2d/b2_friction_joint.h",
        "include/box2d/b2_gear_joint.h",
        "include/box2d/b2_growable_stack.h",
        "include/box2d/b2_joint.h",
        "include/box2d/b2_math.h",
        "include/box2d/b2_motor_joint.h",
        "include/box2d/b2_mouse_joint.h",
        "include/box2d/b2_polygon_shape.h",
        "include/box2d/b2_prismatic_joint.h",
        "include/box2d/b2_pulley_joint.h",
        "include/box2d/b2_revolute_joint.h",
        "include/box2d/b2_rope.h",
        "include/box2d/b2_settings.h",
        "include/box2d/b2_shape.h",
        "include/box2d/b2_stack_allocator.h",
        "include/box2d/b2_time_of_impact.h",
        "include/box2d/b2_timer.h",
        "include/box2d/b2_time_step.h",
        "include/box2d/b2_types.h",
        "include/box2d/b2_weld_joint.h",
        "include/box2d/b2_wheel_joint.h",
        "include/box2d/b2_world.h",
        "include/box2d/b2_world_callbacks.h",
        "include/box2d/box2d.h",
    ]
});
