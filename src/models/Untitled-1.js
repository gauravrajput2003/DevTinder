//delete user api
app.delete("/user", async(req, res) => {
    const userid = req.body.userid;
    try {
        const result = await User.findOneAndDelete({_id: userid});
        if (result) {
            res.send("User deleted successfully");
        } else {
            res.status(404).send("User not found");
        }
    }
    catch(err) {
        res.status(500).send("something went wrong");
    }
})